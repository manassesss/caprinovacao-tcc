'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import LoinEyeReport from './components/LoinEyeReport';

export default function LoinEyeReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>Olho de Lombo (AOL/COL/POL/MOL)</strong> },
        ]}
      />
      <LoinEyeReport />
    </div>
  );
}

