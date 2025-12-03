// Helper function to extract URL from require() result
const getImageUrl = (image: any): string => {
  // If it's already a string (URL), return it
  if (typeof image === 'string') {
    return image;
  }
  
  // if numbner, convert to string
  if (typeof image === 'number') {
    return image.toString();
  }
  
  // if object ,extratc URL
  if (image && typeof image === 'object') {
    if (typeof image.uri === 'string') return image.uri;
    if (typeof image.src === 'string') return image.src;
    if (image.default) {
      const defaultUrl = getImageUrl(image.default);
      if (typeof defaultUrl === 'string' && defaultUrl) return defaultUrl;
    }
    // hcek if array and extact URL
    if (Array.isArray(image) && image.length > 0) {
      return getImageUrl(image[0]);
    }
    // try ti find string that is URL
    for (const key in image) {
      if (typeof image[key] === 'string' && (image[key].startsWith('http') || image[key].startsWith('/'))) {
        return image[key];
      }
    }
  }
  
  //return as string
  return String(image);
};

export const ASSETS = {
  smartspaceLogo: getImageUrl(require("./images/smartspace-logo.png")),
  conferenceImage: getImageUrl(require("./images/conference.jpg")),
  people: getImageUrl(require("./images/people.jpg")),
  icon: getImageUrl(require("./images/icon.svg")),
  conferenceRoomA: getImageUrl(require("./images/conferenceRoomA.jpg")),
  clipboard1: getImageUrl(require("./images/clipboard1.png")),
  clipboard2: getImageUrl(require("./images/clipboard2.png")),
  chairs: getImageUrl(require("./images/chairs.png")),
  handshake: getImageUrl(require("./images/handshake.png")),
  ellipseTop: getImageUrl(require("./images/ellipse-top.png")),
  ellipseBottom: getImageUrl(require("./images/ellipse-bottom.png")),
};
