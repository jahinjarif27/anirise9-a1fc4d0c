import { useParams } from "react-router-dom";
import { ServicePageTemplate } from "@/components/site/services/ServicePageTemplate";

const ComingSoonService = () => {
  const { slug } = useParams();
  return <ServicePageTemplate slug={slug ?? ""} />;
};

export default ComingSoonService;
