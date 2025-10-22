"use client"
import RacesForm from './components/RacesForm';

const EditRace = ({ params }) => {
  const id = params.id?.[0];

  return (
    <div>
      <RacesForm id={id} />
    </div>
  );
}

export default EditRace
