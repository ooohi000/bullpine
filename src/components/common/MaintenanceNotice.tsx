import React from 'react';

type MaintenanceNoticeProps = {
  title?: string;
  description?: string;
};

const MaintenanceNotice = ({
  title = '데이터 동기화 중입니다',
  description = '매일 오전 07:00~08:00에는 데이터 동기화로 인해 서비스를 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
}: MaintenanceNoticeProps) => {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-chart-up">점검 안내</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-4 text-md leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};

export default MaintenanceNotice;
