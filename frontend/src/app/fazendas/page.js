"use client";
import FarmsList from "./components/FarmsList";
import { useRouter } from 'next/navigation';

const Fazendas = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/fazendas/edit/${id ? id : ''}`);
  };

  return (
    <div>
      <FarmsList onEdit={onEdit} />
    </div>
  );
};

export default Fazendas;

