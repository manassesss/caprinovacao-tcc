"use client"
import ReproductiveManagementForm from '../components/ReproductiveManagementForm';

const EditReproductiveManagement = ({ params }) => {
  const id = params.id?.[0];

  return (
    <div>
      <ReproductiveManagementForm id={id} />
    </div>
  );
}

export default EditReproductiveManagement;
