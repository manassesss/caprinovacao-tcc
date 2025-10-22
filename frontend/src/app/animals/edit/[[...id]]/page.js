"use client"
import AnimalsForm from './components/AnimalsForm';

const EditAnimal = ({ params }) => {
  const id = params.id?.[0];

  return (
    <div>
      <AnimalsForm id={id} />
    </div>
  );
}

export default EditAnimal
