"use client"
import EmployeesList from './components/EmployeesList';
import { useRouter } from 'next/navigation';


const Employees = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/employees/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <EmployeesList onEdit={onEdit}/>
    </div>
  );
}

export default  Employees