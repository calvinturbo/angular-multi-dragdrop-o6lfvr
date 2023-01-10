import {Component} from '@angular/core';
import {CdkDragDrop, CdkDragStart, CdkDragEnd, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop connected sorting group
 */
@Component({
  selector: 'cdk-drag-drop-connected-sorting-group-example',
  templateUrl: 'cdk-drag-drop-connected-sorting-group-example.html',
  styleUrls: ['cdk-drag-drop-connected-sorting-group-example.css'],
})
export class CdkDragDropConnectedSortingGroupExample {
  todo = [
    '1a',
    '2b',
    '3c',
    '4d',
    '5e',
  ];

  done = [
    'a1',
    'b2',
    'c3',
    'd4',
    'e5'
  ];

  drop(event: CdkDragDrop<string[]>) {
    // If current element has ".selected"
    if(event.item.element.nativeElement.classList.contains("selected")){
      this.multiDrag.dropListDropped(event);
    }
    // If dont have ".selected" (normal case)
    else{
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex,  event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
                          event.container.data,
                          event.previousIndex,
                          event.currentIndex);
      }
    }
  }










/* TWO OBJECTS */



	// Multi Select
	multiSelect = { // Put ".selected" on elements when clicking after longPress or Ctrl+Click
		// Initial Variables
		longPressTime: 500, // in ms unit
		verifyLongPress: 0,
		multiSelect: false,
		verifyDragStarted: false,
		ctrlMode: false,
		firstContainer: null as unknown as HTMLElement,

		selectDrag(el: HTMLElement) {
			while (!el.classList.contains("cdk-drag")) {
				el = el.parentElement as HTMLElement;
			}
			return el;
		},

		mouseDown(e: Event) {
			let target = this.selectDrag(e.target as HTMLElement);
			let ctrlKey = (e as KeyboardEvent).ctrlKey;

			if (this.multiSelect) { // If multiSelect is enabled

				/* The responsibility for removing only the first ".selected" has to be with mouseDown and not with mouseUp.
				   if not you can't add the first one */

				// Remove
				let allSelected = document.querySelectorAll(".selected").length;
				if (allSelected == 1 && target.classList.contains("selected") && (this.ctrlMode ? ctrlKey : true)) { // If only have one ".selected" and it was clicked
					target.classList.remove("selected", "last");  // remove ".selected" and ".last"
					this.multiSelect = false; // turns off multiSelect
				}
			}

			else { // If multiSelect is disabled
				// Do this
				let addSelected = () => {
					this.multiSelect = true; // enable multiSelect
					this.firstContainer = target.parentElement as HTMLElement; //saves the container of the first selected element
					target.classList.add("selected", "last"); // and add ".selected" and ".last" to the current element clicked
				}

				// If using CTRL
				if (ctrlKey) {
					this.ctrlMode = true;
					addSelected();
				};

				// If using longPress
				this.verifyLongPress = <any>setTimeout(() => { // If there is a LongPress
					this.ctrlMode = false;
					addSelected();
				}, this.longPressTime); // after "longPressTime"(ms)
			}
		},

		mouseUp(e: Event) {
			clearTimeout(this.verifyLongPress); // cancel LongPress

			if (this.multiSelect && !this.verifyDragStarted) { // If multiSelect is enabled AND not start DragStarted
				let target = this.selectDrag(e.target as HTMLElement);
				let allSelected = document.querySelectorAll(".selected");
				let ctrlKey = (e as KeyboardEvent).ctrlKey;
				let last = document.querySelector(".last");

				// If use Shift
				if (last && (e as KeyboardEvent).shiftKey) {
					// take range informations
					let containerLast = Array.from(last.parentElement!.children);
					let lastIndex = containerLast.indexOf(last);
					let currIndex = containerLast.indexOf(target);
					let max = Math.max(lastIndex, currIndex);
					let min = Math.min(lastIndex, currIndex);

					// toggle .selected in the range
					for (let i = min; i <= max; i++) {
						if (i != lastIndex) { // Does not toggle the penult element clicked
							containerLast[i].classList.toggle("selected");
						}
					}

					// put .last if last clicked was selected at end
					if (target.classList.contains("selected")) {
						last && last.classList.remove("last"); // remove .last from penult element clicked
						target.classList.add("last"); // and add ".last" to the current element
					}
				}

				//If don't use shift
				else {
					// To remove from selection
					/* responsibility to remove from selection assigned to mouseUp */
					if (target.classList.contains("selected") && allSelected.length > 1 && (this.ctrlMode ? ctrlKey : true)) { // If the clicked element already has ".selected" AND If you have more than 1 (not to remove the first one added)
						target.classList.remove("selected"); // remove ".selected"
						target.classList.remove("last"); // remove ".last"
					}

					// To add to selection
					else { // if the clicked element does not have the ".selected"
						if (this.firstContainer == target.parentElement && (this.ctrlMode ? ctrlKey : true)) { //if the item click is made within the same container
							last && last.classList.remove("last"); // remove .last from penult element clicked
							target.classList.add("selected", "last"); // add ".selected" and ".last"
						}
						else if (this.ctrlMode ? ctrlKey : true) { // if in different container, and with ctrl (if ctrl)
							allSelected.forEach((el) => { // remove all selected from last container
								el.classList.remove("selected", "hide", "last");
							});
							this.firstContainer = target.parentElement as HTMLElement; //saves the container of the new selected element
							target.classList.add("selected", "last"); // and add ".selected" to the element clicked in the new container
						}
					}

				}
			}
		},

		dragStarted() {
			this.verifyDragStarted = true; // shows to mouseDown and mouseUp that Drag started
			clearTimeout(this.verifyLongPress); // cancel longPress
		},

		dragEnded() {
			this.verifyDragStarted = false; // show mouseDown and mouseUp that Drag is over
		},

		dropListDropped(e: CdkDragDrop<string[]>) {
			let el = e.item.element.nativeElement;
			if (el.classList.contains("selected")) { // the dragged element was of the "selected" class
				this.multiSelect = false; // disable multiSelect
			}
		},

	}

	// Multi Drag
	multiDrag = { // Adjusts clicked items that have ".selected" to organize together
		// Initial Variables
		dragList: [""], // has the value of the selected items in sequence from listData
		dragListCopy: [""], // a copy of the listData, but with the selected elements marked with "DragErase" to delete later
		dragErase: Symbol("DragErase") as any, // a symbol to have unique value when deleting

		dragStarted(e: CdkDragStart) {
			if (e.source.element.nativeElement.classList.contains("selected")) { // If the dragged element has ".selected"
				//prepare
				let listData = e.source.dropContainer.data; // get list data value
				this.dragList = []; // reset the dragList
				this.dragListCopy = [...listData]; // copy listData into variable
				let DOMdragEl = e.source.element.nativeElement; // dragged element
				let DOMcontainer = Array.from(DOMdragEl.parentElement!.children); // container where all draggable elements are
				let DOMdragElIndex = DOMcontainer.indexOf(DOMdragEl); // index of the dragged element
				let allSelected = document.querySelectorAll(".selected"); // get all the ".selected"

				// Goes through all ".selected"
				allSelected.forEach((eli) => {
					// get index of current element
					let CurrDOMelIndexi = DOMcontainer.indexOf(eli);

					// Add listData of current ".selected" to dragList
					this.dragList.push(listData[CurrDOMelIndexi]);

					// Replaces current position in dragListCopy with "DragErase" (to erase exact position later)
					this.dragListCopy[CurrDOMelIndexi] = this.dragErase;

					// Put opacity effect (by CSS class ".hide") on elements (after starting Drag)
					if (DOMdragElIndex !== CurrDOMelIndexi) {
						eli.classList.add("hide");
					}
				});

			}
		},

		dropListDropped(e: CdkDragDrop<string[]>) {

			if (e.previousContainer === e.container) { // If in the same container

				let posAdjust = e.previousIndex < e.currentIndex ? 1 : 0; // Adjusts the placement position
				this.dragListCopy.splice(e.currentIndex + posAdjust, 0, ...this.dragList); // put elements in dragListCopy
				this.dragListCopy = this.dragListCopy.filter((el) => (el !== this.dragErase)); // remove the "DragErase" from the list

				// Pass item by item to final list
				for (let i = 0; i < e.container.data.length; i++) {
					e.container.data[i] = this.dragListCopy[i];
				}

			}

			else { // If in different containers

				// remove the "DragErase" from the list
				this.dragListCopy = this.dragListCopy.filter((el) => (el !== this.dragErase));

				// Pass item by item to initial list
				for (let i = 0; i < e.previousContainer.data.length; i++) {
					e.previousContainer.data[i] = this.dragListCopy[i];
				}
				for (let i = 0; i < this.dragList.length; i++) {
					e.previousContainer.data.pop();
				}


				let otherListCopy = [...e.container.data]; // list of new container
				otherListCopy.splice(e.currentIndex, 0, ...this.dragList); // put elements in otherListCopy

				// Pass item by item to final list
				for (let i = 0; i < otherListCopy.length; i++) {
					e.container.data[i] = otherListCopy[i];
				}

			}

			// Remove ".hide"
			let allHidden = document.querySelectorAll(".hide");
			allHidden.forEach((el) => {
				el.classList.remove("hide");
			});
			// Remove ".selected" after 300ms
			setTimeout(() => {
				let allSelected = document.querySelectorAll(".selected");
				allSelected.forEach((el) => {
					el.classList.remove("selected", "last");
				});
			}, 300);


			this.dragListCopy = []; // reset the dragListCopy
			this.dragList = []; // reset the dragList
		},

	}


/* END TWO OBJECTS */








}


/**  Copyright 2019 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license 
	
	https://stackblitz.com/angular/roarjaabxol
	*/