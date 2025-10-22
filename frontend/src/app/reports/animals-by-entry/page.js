'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import AnimalsByEntryReport from './components/AnimalsByEntryReport';

export default function AnimalsByEntryReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>Animais por Entrada</strong> },
        ]}
      />
      <AnimalsByEntryReport />
    </div>
  );
}

