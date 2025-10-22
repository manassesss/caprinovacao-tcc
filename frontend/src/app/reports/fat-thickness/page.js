'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import FatThicknessReport from './components/FatThicknessReport';

export default function FatThicknessReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>Espessura de Gordura</strong> },
        ]}
      />
      <FatThicknessReport />
    </div>
  );
}

