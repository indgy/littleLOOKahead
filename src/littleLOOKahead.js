// littleLOOKahead v0.1.0
// TODO use min chars
// TODO add loading indicator
// TODO use status messages
function littleLOOKahead(settings) {
    return {
        items: [],
        itemsIndex: 0,
        settings: {
            url: null,
            min: 2,
            limit: 10,
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'littleLOOKahead'
            },
            messages: {
                loading: 'Looking...',
                failed: 'Failed to fetch anything',
                empty: 'No matches',
            },
        },
        state: {
          display: false,
          error: false,
          loading: false,
          aria: {
            expanded: false,
          },
        },
        value: "",
        init() {
          // set all this in code
          this.value = this.$refs.input.getAttribute('value');
          this.$refs.input.setAttribute('x-model', 'value');
          this.$refs.input.setAttribute('x-on:keyup', 'inputKeyPressed()');
          this.$refs.input.setAttribute('x-on:click', 'show()');
          this.$refs.input.setAttribute('role', 'combobox');
          this.$refs.input.setAttribute('aria-autocomplete', 'false');
          this.$refs.input.setAttribute(':aria-expanded', 'state.aria.expanded');
          this.$refs.input.setAttribute('aria-owns', `${this.$refs.input.id}-input-list`);
          this.$refs.items.setAttribute('role', 'listbox');
          // apply settings
          for (i in settings) {
            if (this.settings.hasOwnProperty(i)) {
              this.settings[i] = settings[i];
            }
          }
        },
        inputKeyPressed() {
          switch (this.$event.key) {
          case 'Tab':
          case 'Enter':
            // ignore
            break;
          case 'ArrowDown':
            // enter the items list
            this.enter();
            break;
          case 'Escape':
            // hide the items list
            this.hide();
            break;
          default:
            this.fetch();
          }
        },
        itemKeyPressed(value, id) {
          switch (this.$event.key) {
          case 'ArrowUp':
            this.prev(value);
            break;
          case 'ArrowDown':
            this.next(value);
            break;
          case 'ArrowRight':
            // go back to input box
            this.$refs.input.focus();
            this.$refs.input.setSelectionRange(999,999);
            break;
          case 'ArrowLeft':
            // go back to input box
            this.$refs.input.focus();
            this.$refs.input.setSelectionRange(0,0);
            break;
          case 'Enter':
            this.set(value, id);
            break;
          case 'Escape':
            this.hide();
          }
        },
        fetch: function() {
          if (this.state.loading) {
            // still sending, wait for this to complete
            // TODO handle throttling and debouncing here
            return;
          }
          this.state.loading = true;
          this.state.error = false;
          fetch(`${this.settings.url}?limit=${this.settings.limit}&search=${this.value}`, {
              headers: this.settings.headers
          }).then(response => {
              return response.json()
          }).then(json => {
                this.items = [];
                for (i in json){
                    this.addRow(json[i]);
                }
                this.show();
            }).then(() => {
                this.state.loading = false;
                this.state.error = false;
            }).catch(error => {
                this.state.loading = false;
                this.state.error = true;
            });
        },
        addRow(item) {
            // add an item to the items list, checks for required fields
            if (typeof item.id === 'undefined' || typeof item.value === 'undefined') {
                console.log("Cannot add an option without id or value properties");
            }
            // set content if not provided
            if (typeof item.content === 'undefined') {
                item.content = item.value;
            }
            this.items.push(item);
        },
        show() {
            // fake focus on input and show the dropdown items
            if (this.items.length && this.state.display == false) {
                this.state.display = true;
                this.$refs.input.classList.add('has-focus');
                this.state.aria.expanded = true;
            }
        },
        hide() {
            // hide the dropdown items but keep focus on the input
            this.state.display = false;
            this.state.aria.expanded = false;
            this.$refs.input.classList.remove('has-focus');
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
            for (let i=0; i<this.items.length; i++) {
                if (this.items[i].value == val) {
                    return ++i;
                }
            }
            return 1;
        },
        debug() {
            return `Value: ${this.value}\nState: ${JSON.stringify(this.state)}\nSettings: ${JSON.stringify(this.settings)}\nOptions: ${JSON.stringify(this.items)}\n`;
        }
    }
}
