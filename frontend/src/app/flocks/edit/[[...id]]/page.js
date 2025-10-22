"use client"
import FlocksForm from "../components/FlocksForm";
import { Breadcrumb } from "antd";
import { useRouter } from 'next/navigation';
import { useParams  } from 'next/navigation';


const FlocksEdit = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id?.[0];
    const onSaved = () => {
        router.back();
      };
    return (
        <div>
            <Breadcrumb
              items={[{title: 'Cadastros'},{title: <a href="/flocks">Rebanhos</a>},{title: <strong>{id ? 'Editar' : 'Adicionar'}</strong>},]}
            />
            <FlocksForm onSaved={onSaved}/>
        </div>
    );
}

export default FlocksEdit