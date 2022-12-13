// Copyright 2022 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import FocusTrap from 'focus-trap-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { get, has, noop } from 'lodash';
import { usePopper } from 'react-popper';

import type { EmojiPickDataType } from './emoji/EmojiPicker';
import type { LinkPreviewType } from '../types/message/LinkPreviews';
import type { LocalizerType } from '../types/Util';
import type { Props as EmojiButtonPropsType } from './emoji/EmojiButton';
import type { TextAttachmentType } from '../types/Attachment';

import { Button, ButtonVariant } from './Button';
import { ContextMenu } from './ContextMenu';
import { EmojiButton } from './emoji/EmojiButton';
import { LinkPreviewSourceType, findLinks } from '../types/LinkPreview';
import type { MaybeGrabLinkPreviewOptionsType } from '../types/LinkPreview';
import { Input } from './Input';
import { Slider } from './Slider';
import { StoryLinkPreview } from './StoryLinkPreview';
import { TextAttachment } from './TextAttachment';
import { Theme, themeClassName } from '../util/theme';
import { getRGBA, getRGBANumber } from '../mediaEditor/util/color';
import {
  COLOR_BLACK_INT,
  COLOR_WHITE_INT,
  getBackgroundColor,
} from '../util/getStoryBackground';
import { convertShortName } from './emoji/lib';
import { objectMap } from '../util/objectMap';
import { handleOutsideClick } from '../util/handleOutsideClick';
import { ConfirmDiscardDialog } from './ConfirmDiscardDialog';
import { Spinner } from './Spinner';
import { useEscapeHandling } from '../hooks/useEscapeHandling';

export type PropsType = {
  debouncedMaybeGrabLinkPreview: (
    message: string,
    source: LinkPreviewSourceType,
    options?: MaybeGrabLinkPreviewOptionsType
  ) => unknown;
  i18n: LocalizerType;
  isSending: boolean;
  linkPreview?: LinkPreviewType;
  onClose: () => unknown;
  onDone: (textAttachment: TextAttachmentType) => unknown;
  onUseEmoji: (_: EmojiPickDataType) => unknown;
} & Pick<EmojiButtonPropsType, 'onSetSkinTone' | 'recentEmojis' | 'skinTone'>;

enum LinkPreviewApplied {
  None = 'None',
  Automatic = 'Automatic',
  Manual = 'Manual',
}

enum TextStyle {
  Default,
  Regular,
  Bold,
  Serif,
  Script,
  Condensed,
}

enum TextBackground {
  None,
  Background,
  Inverse,
}

const BackgroundStyle = {
  BG1: { color: 4285041620 },
  BG2: { color: 4287006657 },
  BG3: { color: 4290019212 },
  BG4: { color: 4287205768 },
  BG5: { color: 4283667331 },
  BG6: {
    angle: 180,
    startColor: 4279871994,
    endColor: 4294951785,
  },
  BG7: {
    angle: 180,
    startColor: 4282660824,
    endColor: 4294938254,
  },
  BG8: {
    angle: 180,
    startColor: 4278206532,
    endColor: 4287871076,
  },
};

type BackgroundStyleType = typeof BackgroundStyle[keyof typeof BackgroundStyle];

function getBackground(
  bgStyle: BackgroundStyleType
): Pick<TextAttachmentType, 'color' | 'gradient'> {
  if (has(bgStyle, 'color')) {
    return { color: get(bgStyle, 'color') };
  }

  const angle = get(bgStyle, 'angle');
  const startColor = get(bgStyle, 'startColor');
  const endColor = get(bgStyle, 'endColor');

  return {
    gradient: { angle, startColor, endColor },
  };
}

function getBgButtonAriaLabel(
  i18n: LocalizerType,
  textBackground: TextBackground
): string {
  if (textBackground === TextBackground.Background) {
    return i18n('StoryCreator__text-bg--background');
  }

  if (textBackground === TextBackground.Inverse) {
    return i18n('StoryCreator__text-bg--inverse');
  }

  return i18n('StoryCreator__text-bg--none');
}

export function TextStoryCreator({
  debouncedMaybeGrabLinkPreview,
  i18n,
  isSending,
  linkPreview,
  onClose,
  onDone,
  onSetSkinTone,
  onUseEmoji,
  recentEmojis,
  skinTone,
}: PropsType): JSX.Element {
  const [showConfirmDiscardModal, setShowConfirmDiscardModal] = useState(false);

  const onTryClose = useCallback(() => {
    setShowConfirmDiscardModal(true);
  }, [setShowConfirmDiscardModal]);

  const [isEditingText, setIsEditingText] = useState(false);
  const [selectedBackground, setSelectedBackground] =
    useState<BackgroundStyleType>(BackgroundStyle.BG1);
  const [textStyle, setTextStyle] = useState<TextStyle>(TextStyle.Regular);
  const [textBackground, setTextBackground] = useState<TextBackground>(
    TextBackground.None
  );
  const [sliderValue, setSliderValue] = useState<number>(100);
  const [text, setText] = useState<string>('');

  const [isColorPickerShowing, setIsColorPickerShowing] = useState(false);
  const [colorPickerPopperButtonRef, setColorPickerPopperButtonRef] =
    useState<HTMLButtonElement | null>(null);
  const [colorPickerPopperRef, setColorPickerPopperRef] =
    useState<HTMLDivElement | null>(null);

  const [toolsRef, setToolsRef] = useState<HTMLDivElement | null>(null);
  const [controlTextButtonRef, setControlTextButtonRef] =
    useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isEditingText) {
      return noop;
    }
    return handleOutsideClick(
      () => {
        setIsEditingText(false);
        return true;
      },
      {
        containerElements: [toolsRef, controlTextButtonRef],
        name: 'TextStoryCreator.fontEditor',
      }
    );
  }, [toolsRef, controlTextButtonRef, isEditingText]);

  const colorPickerPopper = usePopper(
    colorPickerPopperButtonRef,
    colorPickerPopperRef,
    {
      modifiers: [
        {
          name: 'arrow',
        },
      ],
      placement: 'top',
      strategy: 'fixed',
    }
  );

  const [linkPreviewApplied, setLinkPreviewApplied] = useState(
    LinkPreviewApplied.None
  );
  const hasLinkPreviewApplied = linkPreviewApplied !== LinkPreviewApplied.None;
  const [linkPreviewInputValue, setLinkPreviewInputValue] = useState('');

  useEffect(() => {
    if (!linkPreviewInputValue) {
      return;
    }
    if (linkPreviewApplied === LinkPreviewApplied.Manual) {
      return;
    }
    debouncedMaybeGrabLinkPreview(
      linkPreviewInputValue,
      LinkPreviewSourceType.StoryCreator,
      {
        mode: 'story',
      }
    );
  }, [
    debouncedMaybeGrabLinkPreview,
    linkPreviewApplied,
    linkPreviewInputValue,
  ]);

  useEffect(() => {
    if (!text) {
      return;
    }
    if (linkPreviewApplied === LinkPreviewApplied.Manual) {
      return;
    }
    debouncedMaybeGrabLinkPreview(text, LinkPreviewSourceType.StoryCreator);
  }, [debouncedMaybeGrabLinkPreview, linkPreviewApplied, text]);

  useEffect(() => {
    if (!linkPreview || !text) {
      return;
    }

    const links = findLinks(text);

    const shouldApplyLinkPreview = links.includes(linkPreview.url);
    setLinkPreviewApplied(oldValue => {
      if (oldValue === LinkPreviewApplied.Manual) {
        return oldValue;
      }
      if (shouldApplyLinkPreview) {
        return LinkPreviewApplied.Automatic;
      }
      return LinkPreviewApplied.None;
    });
  }, [linkPreview, text]);

  const [isLinkPreviewInputShowing, setIsLinkPreviewInputShowing] =
    useState(false);
  const [linkPreviewInputPopperButtonRef, setLinkPreviewInputPopperButtonRef] =
    useState<HTMLButtonElement | null>(null);
  const [linkPreviewInputPopperRef, setLinkPreviewInputPopperRef] =
    useState<HTMLDivElement | null>(null);

  const linkPreviewInputPopper = usePopper(
    linkPreviewInputPopperButtonRef,
    linkPreviewInputPopperRef,
    {
      modifiers: [
        {
          name: 'arrow',
        },
      ],
      placement: 'top',
      strategy: 'fixed',
    }
  );

  useEffect(() => {
    if (!isLinkPreviewInputShowing) {
      return noop;
    }
    return handleOutsideClick(
      () => {
        setIsLinkPreviewInputShowing(false);
        return true;
      },
      {
        containerElements: [
          linkPreviewInputPopperRef,
          linkPreviewInputPopperButtonRef,
        ],
        name: 'TextStoryCreator.linkPreview',
      }
    );
  }, [
    isLinkPreviewInputShowing,
    linkPreviewInputPopperButtonRef,
    linkPreviewInputPopperRef,
  ]);

  useEscapeHandling(
    useCallback(() => {
      if (isColorPickerShowing || isEditingText || isLinkPreviewInputShowing) {
        setIsColorPickerShowing(false);
        setIsEditingText(false);
        setIsLinkPreviewInputShowing(false);
      } else {
        onTryClose();
      }
    }, [
      isColorPickerShowing,
      isEditingText,
      isLinkPreviewInputShowing,
      onTryClose,
    ]),
    true
  );

  useEffect(() => {
    if (!isColorPickerShowing) {
      return noop;
    }
    return handleOutsideClick(
      () => {
        setIsColorPickerShowing(false);
        return true;
      },
      {
        containerElements: [colorPickerPopperRef, colorPickerPopperButtonRef],
        name: 'TextStoryCreator.colorPicker',
      }
    );
  }, [isColorPickerShowing, colorPickerPopperRef, colorPickerPopperButtonRef]);

  const sliderColorNumber = getRGBANumber(sliderValue);

  let textForegroundColor = sliderColorNumber;
  let textBackgroundColor: number | undefined;

  if (textBackground === TextBackground.Background) {
    textBackgroundColor = COLOR_WHITE_INT;
    textForegroundColor =
      sliderValue >= 95 ? COLOR_BLACK_INT : sliderColorNumber;
  } else if (textBackground === TextBackground.Inverse) {
    textBackgroundColor =
      sliderValue >= 95 ? COLOR_BLACK_INT : sliderColorNumber;
    textForegroundColor = COLOR_WHITE_INT;
  }

  const textAttachment: TextAttachmentType = {
    ...getBackground(selectedBackground),
    text,
    textStyle,
    textForegroundColor,
    textBackgroundColor,
    preview: hasLinkPreviewApplied ? linkPreview : undefined,
  };

  const hasChanges = Boolean(text || hasLinkPreviewApplied);

  const textEditorRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
      <div className="StoryCreator">
        <div className="StoryCreator__container">
          <TextAttachment
            disableLinkPreviewPopup
            i18n={i18n}
            isEditingText={isEditingText}
            onChange={setText}
            onClick={() => {
              if (!isEditingText) {
                setIsEditingText(true);
              }
            }}
            onRemoveLinkPreview={() => {
              setLinkPreviewApplied(LinkPreviewApplied.None);
            }}
            ref={textEditorRef}
            textAttachment={textAttachment}
          />
        </div>
        <div className="StoryCreator__toolbar">
          {isEditingText ? (
            <div className="StoryCreator__tools" ref={setToolsRef}>
              <Slider
                handleStyle={{ backgroundColor: getRGBA(sliderValue) }}
                label={getRGBA(sliderValue)}
                moduleClassName="HueSlider StoryCreator__tools__tool"
                onChange={setSliderValue}
                value={sliderValue}
              />
              <ContextMenu
                i18n={i18n}
                menuOptions={[
                  {
                    icon: 'StoryCreator__icon--font-regular',
                    label: i18n('StoryCreator__text--regular'),
                    onClick: () => setTextStyle(TextStyle.Regular),
                    value: TextStyle.Regular,
                  },
                  {
                    icon: 'StoryCreator__icon--font-bold',
                    label: i18n('StoryCreator__text--bold'),
                    onClick: () => setTextStyle(TextStyle.Bold),
                    value: TextStyle.Bold,
                  },
                  {
                    icon: 'StoryCreator__icon--font-serif',
                    label: i18n('StoryCreator__text--serif'),
                    onClick: () => setTextStyle(TextStyle.Serif),
                    value: TextStyle.Serif,
                  },
                  {
                    icon: 'StoryCreator__icon--font-script',
                    label: i18n('StoryCreator__text--script'),
                    onClick: () => setTextStyle(TextStyle.Script),
                    value: TextStyle.Script,
                  },
                  {
                    icon: 'StoryCreator__icon--font-condensed',
                    label: i18n('StoryCreator__text--condensed'),
                    onClick: () => setTextStyle(TextStyle.Condensed),
                    value: TextStyle.Condensed,
                  },
                ]}
                moduleClassName={classNames('StoryCreator__tools__tool', {
                  'StoryCreator__tools__button--font-regular':
                    textStyle === TextStyle.Regular,
                  'StoryCreator__tools__button--font-bold':
                    textStyle === TextStyle.Bold,
                  'StoryCreator__tools__button--font-serif':
                    textStyle === TextStyle.Serif,
                  'StoryCreator__tools__button--font-script':
                    textStyle === TextStyle.Script,
                  'StoryCreator__tools__button--font-condensed':
                    textStyle === TextStyle.Condensed,
                })}
                theme={Theme.Dark}
                value={textStyle}
              />
              <button
                aria-label={getBgButtonAriaLabel(i18n, textBackground)}
                className={classNames('StoryCreator__tools__tool', {
                  'StoryCreator__tools__button--bg-none':
                    textBackground === TextBackground.None,
                  'StoryCreator__tools__button--bg':
                    textBackground === TextBackground.Background,
                  'StoryCreator__tools__button--bg-inverse':
                    textBackground === TextBackground.Inverse,
                })}
                onClick={() => {
                  if (textBackground === TextBackground.None) {
                    setTextBackground(TextBackground.Background);
                  } else if (textBackground === TextBackground.Background) {
                    setTextBackground(TextBackground.Inverse);
                  } else {
                    setTextBackground(TextBackground.None);
                  }
                }}
                type="button"
              />
              <EmojiButton
                className="StoryCreator__emoji-button"
                i18n={i18n}
                onPickEmoji={data => {
                  onUseEmoji(data);
                  const emoji = convertShortName(data.shortName, data.skinTone);
                  const insertAt =
                    textEditorRef.current?.selectionEnd ?? text.length;
                  setText(
                    originalText =>
                      `${originalText.substr(
                        0,
                        insertAt
                      )}${emoji}${originalText.substr(insertAt, text.length)}`
                  );
                }}
                recentEmojis={recentEmojis}
                skinTone={skinTone}
                onSetSkinTone={onSetSkinTone}
              />
            </div>
          ) : (
            <div className="StoryCreator__toolbar--space" />
          )}
          <div className="StoryCreator__toolbar--buttons">
            <Button
              onClick={onTryClose}
              theme={Theme.Dark}
              variant={ButtonVariant.Secondary}
            >
              {i18n('discard')}
            </Button>
            <div className="StoryCreator__controls">
              <button
                aria-label={i18n('StoryCreator__story-bg')}
                className={classNames({
                  StoryCreator__control: true,
                  'StoryCreator__control--bg': true,
                  'StoryCreator__control--bg--selected': isColorPickerShowing,
                })}
                onClick={() => setIsColorPickerShowing(!isColorPickerShowing)}
                ref={setColorPickerPopperButtonRef}
                style={{
                  background: getBackgroundColor(
                    getBackground(selectedBackground)
                  ),
                }}
                type="button"
              />
              {isColorPickerShowing && (
                <div
                  className="StoryCreator__popper"
                  ref={setColorPickerPopperRef}
                  style={colorPickerPopper.styles.popper}
                  {...colorPickerPopper.attributes.popper}
                >
                  <div
                    data-popper-arrow
                    className="StoryCreator__popper__arrow"
                  />
                  {objectMap<BackgroundStyleType>(
                    BackgroundStyle,
                    (bg, backgroundValue) => (
                      <button
                        aria-label={i18n('StoryCreator__story-bg')}
                        className={classNames({
                          StoryCreator__bg: true,
                          'StoryCreator__bg--selected':
                            selectedBackground === backgroundValue,
                        })}
                        key={String(bg)}
                        onClick={() => {
                          setSelectedBackground(backgroundValue);
                          setIsColorPickerShowing(false);
                        }}
                        type="button"
                        style={{
                          background: getBackgroundColor(
                            getBackground(backgroundValue)
                          ),
                        }}
                      />
                    )
                  )}
                </div>
              )}
              <button
                aria-label={i18n('StoryCreator__control--text')}
                className={classNames({
                  StoryCreator__control: true,
                  'StoryCreator__control--text': true,
                  'StoryCreator__control--selected': isEditingText,
                })}
                onClick={() => {
                  setIsEditingText(!isEditingText);
                }}
                type="button"
                ref={setControlTextButtonRef}
              />
              <button
                aria-label={i18n('StoryCreator__control--link')}
                className="StoryCreator__control StoryCreator__control--link"
                onClick={() =>
                  setIsLinkPreviewInputShowing(!isLinkPreviewInputShowing)
                }
                ref={setLinkPreviewInputPopperButtonRef}
                type="button"
              />
              {isLinkPreviewInputShowing && (
                <div
                  className={classNames(
                    'StoryCreator__popper StoryCreator__link-preview-input-popper',
                    themeClassName(Theme.Dark)
                  )}
                  ref={setLinkPreviewInputPopperRef}
                  style={linkPreviewInputPopper.styles.popper}
                  {...linkPreviewInputPopper.attributes.popper}
                >
                  <div
                    data-popper-arrow
                    className="StoryCreator__popper__arrow"
                  />
                  <Input
                    disableSpellcheck
                    i18n={i18n}
                    moduleClassName="StoryCreator__link-preview-input"
                    onChange={setLinkPreviewInputValue}
                    placeholder={i18n('StoryCreator__link-preview-placeholder')}
                    ref={el => el?.focus()}
                    value={linkPreviewInputValue}
                  />
                  <div className="StoryCreator__link-preview-container">
                    {linkPreview ? (
                      <>
                        <div className="StoryCreator__link-preview-wrapper">
                          <StoryLinkPreview
                            {...linkPreview}
                            forceCompactMode
                            i18n={i18n}
                          />
                        </div>
                        <Button
                          className="StoryCreator__link-preview-button"
                          onClick={() => {
                            setLinkPreviewApplied(LinkPreviewApplied.Manual);
                            setIsLinkPreviewInputShowing(false);
                          }}
                          theme={Theme.Dark}
                          variant={ButtonVariant.Primary}
                        >
                          {i18n('StoryCreator__add-link')}
                        </Button>
                      </>
                    ) : (
                      <div className="StoryCreator__link-preview-empty">
                        <div className="StoryCreator__link-preview-empty__icon" />
                        {i18n('StoryCreator__link-preview-empty')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button
              disabled={!hasChanges || isSending}
              onClick={() => onDone(textAttachment)}
              theme={Theme.Dark}
              variant={ButtonVariant.Primary}
            >
              {isSending ? (
                <Spinner svgSize="small" />
              ) : (
                i18n('StoryCreator__next')
              )}
            </Button>
          </div>
        </div>
        {showConfirmDiscardModal && (
          <ConfirmDiscardDialog
            i18n={i18n}
            onClose={() => setShowConfirmDiscardModal(false)}
            onDiscard={onClose}
          />
        )}
      </div>
    </FocusTrap>
  );
}
