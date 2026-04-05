'use client';

import React, { useMemo } from 'react';

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const getInterpolatedColor = (
  progress: number,
  saturation: number,
  lightness: number,
) => {
  const hue = Math.round(progress * 120);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

type LandingSectionProps = {
  scrollProgress: number;
};

const BOX_CONFIGS = [
  { id: 'lg1', segment: 2, saturation: 62, lightness: 42 },
  { id: 'md1', segment: 4, saturation: 60, lightness: 46 },
  { id: 'md2', segment: 1, saturation: 61, lightness: 40 },
  { id: 'sm1', segment: 5, saturation: 57, lightness: 48 },
  { id: 'sm2', segment: 6, saturation: 64, lightness: 38 },
  { id: 'sm3', segment: 3, saturation: 58, lightness: 44 },
  { id: 'sm4', segment: 0, saturation: 56, lightness: 42 },
  { id: 'sm5', segment: 7, saturation: 59, lightness: 45 },
  { id: 'sm6', segment: 8, saturation: 55, lightness: 39 },
] as const;

const getBoxProgress = (
  globalProgress: number,
  index: number,
  total: number,
) => {
  const segment = 1 / total;
  const start = index * segment;
  const end = start + segment;
  return clamp((globalProgress - start) / (end - start), 0, 1);
};

const LandingSection = ({ scrollProgress }: LandingSectionProps) => {
  const totalBoxes = 9;
  const boxProgresses = useMemo(() => {
    return Array.from({ length: totalBoxes }, (_, index) =>
      getBoxProgress(scrollProgress, index, totalBoxes),
    );
  }, [scrollProgress]);

  const boxColors = useMemo(() => {
    const colors: Record<string, string> = {};
    for (const config of BOX_CONFIGS) {
      colors[config.id] = getInterpolatedColor(
        boxProgresses[config.segment],
        config.saturation,
        config.lightness,
      );
    }
    return colors as {
      lg1: string;
      md1: string;
      md2: string;
      sm1: string;
      sm2: string;
      sm3: string;
      sm4: string;
      sm5: string;
      sm6: string;
    };
  }, [boxProgresses]);

  return (
    <div className="w-[400px] h-[300px]">
      <div className="flex h-full">
        <div
          id="lg-box-1"
          className="w-3/5 h-full border-background border-solid border-[1px] text-[16px] font-medium text-foreground flex items-center justify-center"
          style={{ backgroundColor: boxColors.lg1 }}
        >
          Balance Sheet
        </div>
        <div className="flex flex-col w-2/5 h-full">
          <div
            id="md-box-1"
            className="w-full h-1/3 border-background border-solid border-[1px] text-[14px] font-medium text-foreground flex items-center justify-center"
            style={{ backgroundColor: boxColors.md1 }}
          >
            Income Statement
          </div>
          <div
            id="md-box-2"
            className="w-full h-1/3 border-background border-solid border-[1px] text-[13px] font-medium text-foreground flex items-center justify-center"
            style={{ backgroundColor: boxColors.md2 }}
          >
            Cash Flow Statement
          </div>
          <div className="flex w-full h-1/3">
            <div className="flex flex-col w-1/2 h-full">
              <div
                id="sm-box-1"
                className="w-full h-2/3 border-background border-solid border-[1px] text-[12px] px-2 font-medium text-foreground flex items-center justify-center"
                style={{ backgroundColor: boxColors.sm1 }}
              >
                Financial Ratios
              </div>
              <div
                id="sm-box-2"
                className="w-full h-1/3 border-background border-solid border-[1px]"
                style={{ backgroundColor: boxColors.sm2 }}
              ></div>
            </div>
            <div className="flex flex-col w-1/2 h-full">
              <div
                id="sm-box-3"
                className="w-full h-1/3 border-background border-solid border-[1px]"
                style={{ backgroundColor: boxColors.sm3 }}
              ></div>
              <div className="flex w-full h-2/3">
                <div className="flex flex-col w-3/4 h-full">
                  <div
                    id="sm-box-4"
                    className="w-full h-3/5 border-background border-solid border-[1px] text-[11px] px-2 font-medium text-foreground flex items-center justify-center"
                    style={{ backgroundColor: boxColors.sm4 }}
                  >
                    Key Metrics
                  </div>
                  <div
                    id="sm-box-5"
                    className="w-full h-2/5 border-background border-solid border-[1px]"
                    style={{ backgroundColor: boxColors.sm5 }}
                  ></div>
                </div>
                <div
                  id="sm-box-6"
                  className="w-1/4 h-full border-background border-solid border-[1px]"
                  style={{ backgroundColor: boxColors.sm6 }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingSection;
