"use client"
import IllnessesForm from './components/illnessesForm';

const EditIllness = ({ params }) => {
  const id = params.id?.[0];

  return (
    <div>
      <IllnessesForm id={id} />
    </div>
  );
}

export default EditIllness