"use client"
import MedicinesForm from './components/MedicinesForm';

const EditMedicine = ({ params }) => {
  const id = params.id?.[0];

  return (
    <div>
      <MedicinesForm id={id} />
    </div>
  );
}

export default EditMedicine
