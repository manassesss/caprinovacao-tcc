'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import ParasiteControlReportComponent from './components/ParasiteControlReportComponent';

export default function ParasiteControlReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>Controle Parasitário</strong> },
        ]}
      />
      <ParasiteControlReportComponent />
    </div>
  );
}

