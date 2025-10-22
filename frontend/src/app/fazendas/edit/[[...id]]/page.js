"use client";
import FarmsForm from "./components/FarmsForm";
import { useParams } from 'next/navigation';

const FarmsEdit = () => {
  const params = useParams();
  const id = params?.id?.[0];

  return (
    <div>
      <FarmsForm id={id} />
    </div>
  );
};

export default FarmsEdit;

