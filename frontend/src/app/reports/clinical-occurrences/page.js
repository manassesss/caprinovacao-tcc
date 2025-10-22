'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import ClinicalOccurrencesReport from './components/ClinicalOccurrencesReport';

export default function ClinicalOccurrencesReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>Ocorrências Clínicas</strong> },
        ]}
      />
      <ClinicalOccurrencesReport />
    </div>
  );
}

