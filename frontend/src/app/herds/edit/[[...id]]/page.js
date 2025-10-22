"use client"
import HerdsForm from './components/HerdsForm';

const EditHerd = ({ params }) => {
  const id = params.id?.[0];

  return (
    <div>
      <HerdsForm id={id} />
    </div>
  );
}

export default EditHerd

