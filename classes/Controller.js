class Controller {
  constructor() {
    this.buttonMove;
    this.firstPerson;
    this.thirdPerson;
  }

  isTouched(touch, end) {
    let button, index0;

    for (index0 = this.buttonMove.length - 1; index0 > -1; --index0) {
      button = this.buttonMove[index0];

      if (button.containsPoint(touch.clientX, touch.clientY) && !end) {
        button.active = true;
      }

      if (end) button.active = false;
    }

    if (this.firstPerson.containsPoint(touch.clientX, touch.clientY))
      this.firstPerson.active = true;
    else this.firstPerson.active = false;

    if (this.thirdPerson.containsPoint(touch.clientX, touch.clientY))
      this.thirdPerson.active = true;
    else this.thirdPerson.active = false;
  }
}

class Button {
  constructor(x, y, width, height, id) {
    this.active = false;
    this.id = id;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }

  containsPoint(x, y) {
    if (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    )
      return true;
    return false;
  }
}
