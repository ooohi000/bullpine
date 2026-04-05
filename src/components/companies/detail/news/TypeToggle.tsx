'use client';

import React, { useState } from 'react';

type TabId = 'news' | 'press';

interface TypeToggleProps {
  activeTab: TabId;
  handleTabChange: (tab: TabId) => void;
  tabs: { id: TabId; label: string }[];
}

const TypeToggle = ({ activeTab, handleTabChange, tabs }: TypeToggleProps) => {
  return (
    <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/50 w-fit">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleTabChange(id)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TypeToggle;
