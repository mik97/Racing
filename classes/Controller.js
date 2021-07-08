class Controller {
  constructor() {
    this.buttonW;
    this.buttonS;
    this.buttonA;
    this.buttonD;
    this.upgrade;
    this.firstPerson;
    this.thirdPerson;
  }

  setController() {
    this.buttonW = document.getElementById("back");
    this.buttonS = document.getElementById("front");
    this.buttonA = document.getElementById("sx");
    this.buttonD = document.getElementById("dx");
    this.upgrade = document.getElementById("upgrade");
    this.firstPerson = document.getElementById("firstPerson");
    this.thirdPerson = document.getElementById("thirdPerson");
  }

  hideController() {
    this.buttonW.hidden = false;
    this.buttonS.hidden = false;
    this.buttonA.hidden = false;
    this.buttonD.hidden = false;
    this.upgrade.hidden = false;
    this.firstPerson.hidden = false;
    this.thirdPerson.hidden = false;
  }
}
