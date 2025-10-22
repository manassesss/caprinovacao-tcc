"use client"
import ReproductiveManagementList from "./components/ReproductiveManagementList";
import { useRouter } from 'next/navigation';

const Animal = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/reproductive-management/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <ReproductiveManagementList onEdit={onEdit}/>
    </div>
  );
}

export default  Animal