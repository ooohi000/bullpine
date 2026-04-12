'use client';

import { NewsItem as NewsItemType } from '@/types/news';
import { NewspaperIcon } from 'lucide-react';
import { ExternalStockImage } from '@/components/common/ExternalStockImage';
import React, { useState } from 'react';

interface NewsItemProps {
  data: NewsItemType[];
}

const PlaceholderIcon = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-muted">
    <NewspaperIcon className="w-10 h-10 text-muted-foreground/50" />
  </div>
);

const Thumbnail = ({ image }: { image?: string }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const wrapperClass =
    'relative w-full sm:w-36 sm:shrink-0 aspect-video sm:aspect-square bg-muted overflow-hidden';

  const showPlaceholder = !image?.trim() || loadFailed;

  return (
    <div className={wrapperClass}>
      {showPlaceholder ? (
        <PlaceholderIcon />
      ) : (
        <ExternalStockImage
          src={image!}
          alt=""
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 100vw, 144px"
          onError={() => setLoadFailed(true)}
          onMissing={() => setLoadFailed(true)}
        />
      )}
    </div>
  );
};

const NewsItem = ({ data }: NewsItemProps) => {
  return (
    <ul className="flex flex-col gap-3">
      {data.map(
        ({
          image,
          publishedDate,
          publisher,
          text,
          title,
          url,
        }: NewsItemType) => (
          <li
            key={`${publishedDate}-${title}-${publisher}`}
            className="rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row sm:min-h-[120px] group"
            >
              <Thumbnail image={image} />
              <div className="flex flex-1 flex-col justify-center gap-1.5 p-4 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {title ?? '(제목 없음)'}
                </h3>
                {text && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {text}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {publisher && <span>{publisher}</span>}
                  {publisher && publishedDate && (
                    <span className="opacity-60">·</span>
                  )}
                  {publishedDate && <span>{publishedDate}</span>}
                </div>
              </div>
            </a>
          </li>
        ),
      )}
    </ul>
  );
};

export default NewsItem;
