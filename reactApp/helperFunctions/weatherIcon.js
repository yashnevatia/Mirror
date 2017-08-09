const weatherIcon = function(iconCode) {
  let icon;
  switch(iconCode) {
  case "01n":
    icon = "moon.png";
    break;
  case "01d":
    icon = "sun.png";
    break;
  case "02n":
    icon = "cloud.png";
    break;
  case "02d":
    icon = "cloud-2.png";
    break;
  case "03n":
  case "03d":
    icon = "cloud-1.png";
    break;
  case "04n":
  case "04d":
    icon = "cloud-1.png";
    break;
  case "09n":
  case "09d":
    icon = "rain-2.png";
    break;
  case "10d":
    icon = "rain.png";
    break;
  case "11n":
  case "11d":
    icon = "rain.png";
    break;
  case "13n":
  case "13d":
    icon = "snow.png";
    break;
  case "50n":
  case "50d":
    icon = "cloud-1.png";
    break;
  default:
    icon = "sun.png";
  }
  return "/icons/" + icon;
};

export default weatherIcon;