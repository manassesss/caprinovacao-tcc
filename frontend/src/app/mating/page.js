"use client"
import MatingStepper from "./components/MatingStepper";
import { useRouter } from 'next/navigation';

const Mating = () => {
  const router = useRouter();

  return (
    <div>
      <MatingStepper/>
    </div>
  );
}

export default  Mating