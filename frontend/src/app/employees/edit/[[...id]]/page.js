"use client";
import EmployeesForm from "./components/EmployeesForm";
import { useParams } from 'next/navigation';

const EmployeesEdit = () => {
  const params = useParams();
  const id = params?.id?.[0];

  return (
    <div>
      <EmployeesForm id={id} />
    </div>
  );
};

export default EmployeesEdit;
