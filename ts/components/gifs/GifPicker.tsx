import React, { Suspense } from 'react';
import FocusTrap from 'focus-trap-react';
import type {
  GifsResult,
  PaginationOptions,
  TypeOption,
} from '@giphy/js-fetch-api';
import { GiphyFetch } from '@giphy/js-fetch-api';
import classNames from 'classnames';
import { useResizeDetector } from 'react-resize-detector';
import type { LocalizerType } from '../../types/Util';
import { Input } from '../Input';
import type { GifFromGiphyType } from '../../sql/Interface';

const CATEGORIES = [
  'trending',
  'celebrate',
  'love',
  'thumbsup',
  'surprised',
  'excited',
  'sad',
  'angry',
] as const;
type CategoryName = 'recent' | 'search' | typeof CATEGORIES[number];

export type Props = Readonly<{
  i18n: LocalizerType;
  onClose: () => void;
  onPickGif: (gif: GifFromGiphyType) => void;
  recentGifs: Array<string>;
  showPickerHint?: boolean;
  style?: React.HTMLProps<HTMLDivElement>['style'];
}>;

// Signal iOS API Key, taken from
// https://github.com/signalapp/Signal-iOS/blob/main/SignalServiceKit/src/Network/API/Giphy/GiphyAPI.swift
// TODO: Replace this with a different API key
const API_KEY = 'ZsUpUm2L6cVbvei347EQNp7HrROjbOdc';

const giphy = new GiphyFetch(API_KEY);

/*
 * The normal Giphy Grid triggers some CSS-in-JS process to kick off
 * *at import time*, which requires document.head to exist, which it
 * doesn't at import time. Hence, the import needs to be delayed and
 * wrapping the lazy import in a Suspense is just a way to do that.
 * For more info, see https://github.com/emotion-js/emotion/issues/2919
 */
const Grid = React.lazy(async () => ({
  default: (await import('@giphy/react-components')).Grid,
}));

export const GifPicker = React.memo(
  React.forwardRef<HTMLDivElement, Props>(
    ({ style, onPickGif, recentGifs, i18n }, ref) => {
      const { ref: resizeDetectorRef, width = 330 } = useResizeDetector({
        observerOptions: {
          box: 'content-box',
        },
      });

      const onGifClick = React.useCallback(
        (gif: GifsResult['data'][number], event: React.SyntheticEvent) => {
          event.preventDefault();
          onPickGif(gif);
        },
        [onPickGif]
      );

      const hasRecentGifs = recentGifs.length > 0;
      const [currentTabName, setCurrentTabName] = React.useState<CategoryName>(
        hasRecentGifs ? 'recent' : 'trending'
      );
      const onCategoryClickFactory = (categoryName: CategoryName) => () => {
        setCurrentTabName(categoryName);
      };

      const [searchTerm, setSearchTerm] = React.useState('');
      const onSearchTermChange = React.useCallback((newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
        setCurrentTabName('search');
      }, []);

      const fetchGifs = React.useCallback(
        (offset: number): Promise<GifsResult> => {
          const config: TypeOption & PaginationOptions = {
            offset,
            limit: 15,
            type: 'gifs',
          };

          if (currentTabName === 'recent') {
            return giphy.gifs(recentGifs);
          }
          if (currentTabName === 'search' && searchTerm) {
            return giphy.search(searchTerm, config);
          }
          // Default to trending before search term has been entered
          if (currentTabName === 'search' || currentTabName === 'trending') {
            return giphy.trending(config);
          }
          return giphy.search(currentTabName, config);
        },
        [currentTabName, recentGifs, searchTerm]
      );

      return (
        <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
          <div className="module-gif-picker" ref={ref} style={style}>
            <div className="module-gif-picker__header">
              <div className="module-gif-picker__header__categories">
                <div className="module-gif-picker__header__categories__slider">
                  {hasRecentGifs ? (
                    <button
                      type="button"
                      onClick={onCategoryClickFactory('recent')}
                      className={classNames(
                        'module-gif-picker__header__categories__slider__button',
                        'module-gif-picker__header__categories__slider__button--recents',
                        {
                          'module-gif-picker__header__categories__slider__button--selected':
                            currentTabName === 'recent',
                        }
                      )}
                      aria-label={i18n('gifs--GifPicker--Recents')}
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={onCategoryClickFactory('search')}
                    className={classNames(
                      'module-gif-picker__header__categories__slider__button',
                      'module-gif-picker__header__categories__slider__button--search',
                      {
                        'module-gif-picker__header__categories__slider__button--selected':
                          currentTabName === 'search',
                      }
                    )}
                    aria-label={i18n('gifs--GifPicker--Search')}
                  />
                  {CATEGORIES.map(category => (
                    <button
                      type="button"
                      key={category}
                      onClick={onCategoryClickFactory(category)}
                      className={classNames(
                        'module-gif-picker__header__categories__slider__button',
                        `module-gif-picker__header__categories__slider__button--${category}`,
                        {
                          'module-gif-picker__header__categories__slider__button--selected':
                            currentTabName === category,
                        }
                      )}
                      aria-label={i18n(`gifs--GifPicker--${category}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="module-gif-picker__body" ref={resizeDetectorRef}>
              <Input
                moduleClassName="module-gif-picker__body__searchbox"
                i18n={i18n}
                value={currentTabName === 'search' ? searchTerm : ''}
                onChange={onSearchTermChange}
                placeholder={i18n('gifs--GifPicker--SearchPlaceholder')}
                hasClearButton
              />
              {/* See Grid component definition (top of file) for explanation */}
              <Suspense fallback={null}>
                <Grid
                  // force rerender when tab or search change
                  key={currentTabName + searchTerm}
                  columns={3}
                  fetchGifs={fetchGifs}
                  width={width}
                  onGifClick={onGifClick}
                  hideAttribution
                />
              </Suspense>
            </div>
          </div>
        </FocusTrap>
      );
    }
  )
);
