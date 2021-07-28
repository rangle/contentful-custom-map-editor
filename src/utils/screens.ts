export const createNewScreenId = () => {
  return `SCREEN:${new Date().getTime().toString(16)}`;
};

export const createNewAreaId = () => {
  return `AREA:${new Date().getTime().toString()}`;
};

export const readFromFile = (file: File) =>
  new Promise<string>((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      console.log("LOADED", fileReader.result);
      resolve(String(fileReader.result));
    };
    fileReader.readAsDataURL(file);
  });
