
	15 line implementation of a dom generator using javascript Proxy objects, making function component composition practical.


	Create a proxy of an empty object. we are never actually accessing this object, only using it to trap calls to its properties
	so that we can create dom elements based on object key names being the type of element to create and the function arguments
	to pass the attributes, children, and event handlers to the created element.

	the dom constant we create can be usage for two things: dom generation and registering custom elements (which then can be generated via dom proxy)

	Dom Generation Usage:
		key: function name called on dom
			accepts: any valid function name (doesn't exist on dom)
			example:
				dom.div() : key is div
				dom.customEle() : key is customEle
				dom.register() : key is register
				dom.sdfwetrf4ew() : key is sdfwetrf4e
			output:
				<div></div>
				<customele></customele>
				undefined
				<sdfwetrf4ew></sdfwetrf4ew>

		attributes: object of attributes to set on element
			accepts: any valid javascript object
			example:
				dom.div({class: 'cls', visibility: false'},[
					dom.span('some text')
				])
			output:
				<div class="clas" visibility="false">
					<span>some text</span>
				</div>

		children: children to append to the created element
			accepts: [primitive, element], or an array of [primitive, element]
			example:
				dom.div(
					dom.div([
						dom.span(),
						dom.a()
				]))
			output:
				<div>
					<div>
						<span></span>
						<a></a>
					</div>
				</div>

		events: object of events to attach to the element
			accepts: any valid javascript object
			example:
				dom.div('hi',{click: () => alert('hi')})
			output:
				<div>hi</div> //when clicked will alert the message 'hi'


	Register Custom Element Usage
		key: the string 'register'
			accepts: 'register'
			example:
				dom.register() : key is register

		attributes: component creation function
			accepts: any function that returns a dom element
			example:
				function link(url) {
					return dom.a({href: url});
				}
				dom.register(link);

	Custom Element Usage
		this is the same as Dom Generation Usage but needs to be done after the element is registered
		and has a different usage of children and different purpose entirely for events
		
		children: children to pass into the registered elements creation function as arguments
		events: data to pass to the generator function
			example:
				function customEle(children, data) {
					return dom.div(
						...children,
						data.someString
					)
				}

				dom.register(customEle);
				dom.customEle(['child1',2], {someString: 'string'})
			output:
				<div>
					child1,
					2,
					string
				</div>