# Iris - The Smart Mirror
* A mirror can do much more than reflect. 
* Cause your face is overrated. 
* Reflections lead to innovations.
* A voice controlled mirror which helps you reflect on your day. (punn intended)

## List of Contents 
- [Usage](#usage) 
- [Requirements](#requirements)
- [Installation](#installation) 
- [Configuration](#configuration)
- [Contribution](#contribution)

## Usage
Iris is a smart mirror we created to make our mornings easier and more efficient.

## Requirements
To have your very own Iris, you will need the following - 
- Raspberry Pi
- Monitor 
- [Two way glass](https://www.tapplastics.com/product/plastics/cut_to_size_plastic/two_way_mirrored_acrylic/558) 
- Mic 
- Pi Camera (optional)

## Installation 
- Clone the repository
```
npm install
```
- [Google Speech setup](#google-speech-setup)
- [snowboy.kitt.ai setup](#snowboy-setup) 
- Twillio setup
- Uber Setup 
 
## Configuration

### Google Speech Setup 
You will need to download the google cloud sdk and get the neccessary api keys. https://cloud.google.com/sdk/

### Snowboy Setup 
Snowboy is a hotword detection software that we use to activate most of the feautres to cut down on requests sent to google. 
Snowboy does not use the internet and is super easy to use. 
* Go to https://snowboy.kitt.ai/
* Setup your pi according to their documentation -> http://docs.kitt.ai/snowboy/
* Create modals online and place them in the correct folder. 

## Contribution
To add a new feature (widget), simply create a pull request and we will look into it. 

## Authors 
[Amanda Hansen](https://github.com/ajoann), [Yashavrdhan Nevatia](https://github.com/yashnevatia), [Sophia Grace](https://github.com/sophiagrace), 
[Asif Bhatti](https://github.com/asif521), [Jens Honack](https://github.com/jenshnck)

## License 

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
