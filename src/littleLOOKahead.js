// littleLOOKahead v0.1.0
// TODO use min chars
// TODO add loading indicator
// TODO use status messages
function littleLOOKahead(settings) {
  return {
    items: [],
    itemsIndex: 0,
    settings: {
      debounce_timeout: 300,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "littleLOOKahead",
      },
      items_limit: 10,
      messages: {
        empty: "No matches",
        failed: "Failed to fetch anything",
        loading: "Looking...",
      },
      min_chars: 2,
      search_on_delete: true,
      throttle_timeout: 150,
      url: null,
    },
    state: {
      aria: {
        expanded: false,
      },
      display: false,
      error: false,
      loading: false,
      throttle: false,
    },
    value: "",
    init() {
      // set all this in code
      this.value = this.$refs.input.getAttribute("value");
      this.$refs.input.setAttribute("x-model", "value");
      // this.$refs.input.setAttribute('x-on:keyup.arrow-down', 'enter()');
      // this.$refs.input.setAttribute('x-on:keyup.escape', 'hide()');
      // this.$refs.input.setAttribute('x-on:keyup.debounce', 'fetch()');
      this.$refs.input.setAttribute("x-on:keyup", "inputKeyPressed()");
      this.$refs.input.setAttribute("x-on:click", "show()");
      this.$refs.input.setAttribute("role", "combobox");
      this.$refs.input.setAttribute("aria-autocomplete", "false");
      this.$refs.input.setAttribute(":aria-expanded", "state.aria.expanded");
      this.$refs.input.setAttribute(
        "aria-owns",
        `${this.$refs.input.id}-input-list`
      );
      this.$refs.items.setAttribute("role", "listbox");
      // apply settings
      for (i in settings) {
        if (this.settings.hasOwnProperty(i)) {
          this.settings[i] = settings[i];
        }
      }
      if (this.settings.min_chars < 1) {
        this.settings.min_chars = 1;
      }
    },
    inputKeyPressed() {
      if (this.value.length < this.settings.min_chars) {
        this.hide();
      }
      switch (this.$event.key) {
        case "Tab":
        case "Enter":
          // ignore
          break;
        case "ArrowDown":
          // enter the items list
          this.enter();
          break;
        case "ArrowUp":
        case "Escape":
          // hide the items list
          this.hide();
          break;
        case "Backspace":
          if (this.settings.search_on_delete) {
            this.debounce(this.fetch(), this.settings.debounce_timeout);
          }
          break;
        default:
          // TODO handle debounce here,
          // pause for user input to complete, before calling fetch
          this.debounce(this.fetch(), this.settings.debounce_timeout);
      }
    },
    itemKeyPressed(value, id) {
      switch (this.$event.key) {
        case "ArrowUp":
          this.prev(value);
          break;
        case "ArrowDown":
          this.next(value);
          break;
        case "ArrowRight":
          // go back to input box
          this.$refs.input.focus();
          this.$refs.input.setSelectionRange(999, 999);
          break;
        case "ArrowLeft":
          // go back to input box
          this.$refs.input.focus();
          this.$refs.input.setSelectionRange(0, 0);
          break;
        case "Enter":
          this.set(value, id);
          break;
        case "Escape":
          this.hide();
      }
    },
    fetch: function () {
      if (this.value.length <= this.settings.min_chars) {
        return;
      }
      if (this.state.loading) {
        return;
      }
      this.state.loading = true;
      this.state.error = false;
      fetch(
        `${this.settings.url}?limit=${this.settings.items_limit}&search=${this.value}`,
        {
          headers: this.settings.headers,
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          this.items = [];
          for (i in json) {
            this.addRow(json[i]);
          }
          this.show();
        })
        .then(() => {
          this.state.loading = false;
          this.state.error = false;
        })
        .catch((error) => {
          this.state.loading = false;
          this.state.error = true;
        });
    },
    addRow(item) {
      // add an item to the items list, checks for required fields
      if (typeof item.id === "undefined" || typeof item.value === "undefined") {
        console.log("Cannot add an option without id or value properties");
      }
      // set content if not provided
      if (typeof item.content === "undefined") {
        item.content = item.value;
      }
      this.items.push(item);
    },
    show() {
      // fake focus on input and show the dropdown items
      if (this.items.length && this.state.display == false) {
        this.state.display = true;
        this.$refs.input.classList.add("has-focus");
        this.state.aria.expanded = true;
      }
    },
    hide() {
      // hide the dropdown items but keep focus on the input
      this.state.display = false;
      this.state.aria.expanded = false;
      this.$refs.input.classList.remove("has-focus");
      this.$refs.input.focus();
    },
    enter() {
      // show and move focus to the dropdown items
      this.show();
      // set keyboard focus to the current item in the list
      let idx = this.getItemsIndex(this.value);
      this.$refs.items.children[idx].focus();
      this.itemsIndex = idx;
    },
    prev() {
      // go to previous option in list, or back to input
      if (this.itemsIndex > 1) {
        this.itemsIndex = this.itemsIndex - 1;
        this.$refs.items.children[this.itemsIndex].focus();
      } else {
        this.hide();
      }
    },
    next() {
      // go to next option in list
      if (this.itemsIndex < this.$refs.items.children.length - 1) {
        this.itemsIndex = this.itemsIndex + 1;
        this.$refs.items.children[this.itemsIndex].focus();
      }
    },
    set(val) {
      // set the input value, requires focus to be set on parent
      // as soon as click event happens, input will blur and
      // the items list disappears before the click event
      this.value = val;
      this.hide();
    },
    getItemsIndex(val) {
      // returns the list index of the option.value matching val
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].value == val) {
          return ++i;
        }
      }
      return 1;
    },
    debounce(func, wait, immediate) {
      // http://john-dugan.com/javascript-debounce/
      var timeout;
      return function () {
        var context = this,
          args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait || 200);
        if (callNow) {
          func.apply(context, args);
        }
      };
    },
    throttle() {
      if (this.state.throttle) {
        return;
      }
      this.state.throttle = setTimeout(() => {
        this.fetch();
        this.state.throttle = false;
      }, this.settings.throttle_timeout);
    },
    debug() {
      return `Value: ${this.value}\nState: ${JSON.stringify(
        this.state
      )}\nSettings: ${JSON.stringify(this.settings)}\nOptions: ${JSON.stringify(
        this.items
      )}\n`;
    },
  };
}
