'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import CPMReport from './components/CPMReport';

export default function CPMReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>CPM - Conformação, Precocidade e Musculatura</strong> },
        ]}
      />
      <CPMReport />
    </div>
  );
}

