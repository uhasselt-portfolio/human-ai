import dynamic from "next/dynamic";


const ClientComponent = dynamic(() => import("@web/components/ClientIndexPage"), {ssr: false});

const IndexPage = () => {

  // Render
  const render = () => {
    return <ClientComponent/>
  }

  return render();
};

export default IndexPage;
