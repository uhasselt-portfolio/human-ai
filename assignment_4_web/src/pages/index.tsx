import dynamic from "next/dynamic";
import {Toaster} from 'react-hot-toast';


const ClientComponent = dynamic(() => import("@web/components/ClientIndexPage"), {ssr: false});

const IndexPage = () => {

  // Render
  const render = () => {
    return <>
      <Toaster/>
      <ClientComponent/>
    </>
  }

  return render();
};

export default IndexPage;
