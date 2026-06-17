import { useParams } from "react-router-dom";
import { ServicePageTemplate } from "@/components/site/services/ServicePageTemplate";

const ComingSoonService = () => {
  const { slug, id } = useParams();
  return <ServicePageTemplate slug={slug ?? id ?? ""} />;
};

export default ComingSoonService;
