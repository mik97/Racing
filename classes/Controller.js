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

  touchStart(event) {
    event.preventDefault();
    drag = true;

    for (let i = 0; i < event.targetTouches.length; i++) {
      oldX = event.targetTouches[i].pageX;
      oldY = event.targetTouches[i].pageY;
    }
  }

  touchMove(event) {
    event.preventDefault();

    if (!drag) return false;

    for (let i = 0; i < event.targetTouches.length; i++) {
      const location = mouseOnCanvas(
        event.targetTouches[i].pageX,
        event.targetTouches[i].pageY
      );

      if (!firstPerson) handleMovement(location);
    }
  }

  touchEnd(event) {
    event.preventDefault();

    drag = false;
  }
}
