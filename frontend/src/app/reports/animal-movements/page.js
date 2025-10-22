'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import AnimalMovementsReport from './components/AnimalMovementsReport';

export default function AnimalMovementsReportPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Relatórios' },
          { title: <strong>Movimentação Animal</strong> },
        ]}
      />
      <AnimalMovementsReport />
    </div>
  );
}

