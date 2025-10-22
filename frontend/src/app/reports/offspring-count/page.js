'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import OffspringCountReport from './components/OffspringCountReport';

export default function OffspringCountReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>Número de Crias</strong> },
        ]}
      />
      <OffspringCountReport />
    </div>
  );
}

