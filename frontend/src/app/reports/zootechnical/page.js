'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import ZootechnicalReport from './components/ZootechnicalReport';

export default function ZootechnicalReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>Dados Zootécnicos do Rebanho</strong> },
        ]}
      />
      <ZootechnicalReport />
    </div>
  );
}

