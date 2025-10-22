'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import DewormingReport from './components/DewormingReport';

export default function DewormingReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>Vermifugação e Resistência</strong> },
        ]}
      />
      <DewormingReport />
    </div>
  );
}

