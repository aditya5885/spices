import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "turmeric",
    name: "Premium Turmeric",
    slug: "premium-turmeric",
    description: "Pure Alleppey Finger Turmeric with exceptionally high curcumin content, sun-dried to perfection.",
    priceInINR: 722.50, // Approx $8.50 USD per kg (at 1 USD = 85 INR)
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhtKgRT1m4yMGEjgtZsCHGZdI9MazdpF6m6zzKRl6e_C15hn4lybVro_rJ2VpaOKGMJYDkEaAG2nT33WbEnFrmpMQFyC40qL22nzXQypE5UPFxA0f7EmRvNpVAy43OYQwXaUirOM2X6Qv3dFcD5eVeJq8HnwJcw8d0URSbMtQEHLfEm3xFgstmJIk00ZiyFDQ_JhdA5TqUFHDErdJ-OMxUZpCQW4WUex5SB7nq-McUCUF3XzXDC87b0JA",
    badge: "95% CURCUMIN",
    specs: "Alleppey Finger, Organic Certified"
  },
  {
    id: "black-pepper",
    name: "Black Pepper",
    slug: "black-pepper",
    description: "King of spices, bold MG1 grade black pepper from the Malabar coast, rich in piperine.",
    priceInINR: 573.75, // Approx $6.75 USD per kg
    image: "https://lh3.googleusercontent.com/aida/ADBb0ui8hqmXxngNsGTBdxpzgTR0NXOd9DhlwsOHZVfVX5SRLx1OhdfjBgENJxMvEy8jcmvwibi18kzU5dZc0m6kgr34pDAbldSJv-Lj6zX3AP-9yehez1DVQtMEx4zUap99rmjCt-bareqwY7PhXRfrHyp8xpo1nV002M14pehVPKQ2cUPxhjiTB3KyY1_BGLMxsv_w7JjbO-_eXb1en8S9hJGtYBo-BMNsQYTYkaifO4jhQJZgt00N3BrVmQ",
    badge: "MG1 BOLD GRADE",
    specs: "Malabar Bold, High Piperine"
  },
  {
    id: "cardamom",
    name: "Green Cardamom",
    slug: "green-cardamom",
    description: "Handpicked extra bold green pods from Idukki, renowned for their intense aroma and fresh flavor.",
    priceInINR: 1870.00, // Approx $22.00 USD per kg
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhQpqVhUP9Zo9Td1Qh3bdZc_wWKBLevg6ETomEsCU3XifPpwO-tWh01MUIiCd05Ls3uvZvlntPlxHcO4JuUTpKICoyVq2dM6CCZ2q6cLTcLBwXOdZYGK3GL8XHk-KfdXVbnQK9fFYmmC8DxGyD5MwYiToQBodpfq_Do8sdVv8o2EmhcMLtZKp31p0sZ4754u0DS8_f0SM6LtsFARyiHQ-tX-ZYOye91i8O5oZMr3bSMd8uFCfMrOAsnDw",
    badge: "8MM+ BOLD",
    specs: "Idukki Premium Green, Extra Bold"
  },
  {
    id: "cinnamon",
    name: "Ceylon Cinnamon",
    slug: "ceylon-cinnamon",
    description: "Authentic thin-quilled cinnamon with a sweet, delicate aroma and low coumarin content.",
    priceInINR: 1572.50, // Approx $18.50 USD per kg
    image: "https://lh3.googleusercontent.com/aida/ADBb0uivuNcKhb4MxwMIKMFRJ2yig8S18rOXR2qvJuFtNU-pu4-qonZPVhTM4x1obkBV6X31_gVDEeG41Vnj-mtIoIaeP2Xx6fqBdNr4CsulaF5hbJsLg91yeAbQGYz8crSB2wuQ6YDmpniad9ME9R3oG39l-oM_nVyxUpVWjzPM-hcYTdd3365kNMkXJSK2sMa1-dK7SCW5i7P9bWPam55t0l6wLF6ihve26wAUu7mAHES-ZKCWeq_O_IPE4B0",
    badge: "ALBA GRADE",
    specs: "Thin Quill Ceylon, Organic"
  },
  {
    id: "ginger-powder",
    name: "Dry Ginger Powder",
    slug: "ginger-powder",
    description: "Zesty, sun-dried ginger ground into a fine powder. Perfect for tea, baking, and traditional recipes.",
    priceInINR: 450.00,
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhtKgRT1m4yMGEjgtZsCHGZdI9MazdpF6m6zzKRl6e_C15hn4lybVro_rJ2VpaOKGMJYDkEaAG2nT33WbEnFrmpMQFyC40qL22nzXQypE5UPFxA0f7EmRvNpVAy43OYQwXaUirOM2X6Qv3dFcD5eVeJq8HnwJcw8d0URSbMtQEHLfEm3xFgstmJIk00ZiyFDQ_JhdA5TqUFHDErdJ-OMxUZpCQW4WUex5SB7nq-McUCUF3XzXDC87b0JA",
    badge: "ORGANIC DRY",
    specs: "Dry Ginger, Fine Ground"
  },
  {
    id: "clove-buds",
    name: "Premium Clove Buds",
    slug: "clove-buds",
    description: "Highly aromatic handpicked clove buds from Kerala. Rich in essential oils with a sweet, spicy pungency.",
    priceInINR: 950.00,
    image: "https://lh3.googleusercontent.com/aida/ADBb0ui8hqmXxngNsGTBdxpzgTR0NXOd9DhlwsOHZVfVX5SRLx1OhdfjBgENJxMvEy8jcmvwibi18kzU5dZc0m6kgr34pDAbldSJv-Lj6zX3AP-9yehez1DVQtMEx4zUap99rmjCt-bareqwY7PhXRfrHyp8xpo1nV002M14pehVPKQ2cUPxhjiTB3KyY1_BGLMxsv_w7JjbO-_eXb1en8S9hJGtYBo-BMNsQYTYkaifO4jhQJZgt00N3BrVmQ",
    badge: "EXTRA BOLD",
    specs: "Handpicked Cloves, High Oil Content"
  }
];

