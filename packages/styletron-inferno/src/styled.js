import createElement from 'inferno-create-element';
import {injectStylePrefixed} from 'styletron-utils';
import {assign, isNil, isObject, isString, isFunction} from './utils';

const STYLETRON_KEY = '__STYLETRON';

export default styled;

/**
 * Helper function to create styled components
 * @packagename styletron-inferno
 * @param  {string|function} name   Tag name or component function/class
 * @param  {function|object} styles Style object or function that returns a style object
 * @return {function}               Styled component
 *
 * @example
 * import { styled } from 'styletron-inferno';
 *
 * const Panel = styled('div', {
 *   backgroundColor: 'lightblue',
 *   fontSize: '12px'
 * });
 *
 * <Panel>Hello World</Panel>
 *
 * @example
 * import { styled } from 'styletron-inferno';
 *
 * const Panel = styled('div', (props) => ({
 *   backgroundColor: props.alert ? 'orange' : 'lightblue',
 *   fontSize: '12px'
 * }));
 *
 * <Panel alert>Danger!</Panel>
 *
 * @example
 * import { styled } from 'styletron-inferno';
 *
 * const DeluxePanel = styled(Panel, (props) => ({
 *   backgroundColor: props.alert ? 'red' : 'lime',
 *   boxShadow: '3px 3px 3px darkgray',
 *   color: 'white'
 * }));
 *
 * <DeluxePanel>Bonjour Monde</DeluxePanel>
 */
function styled(name, styles) {
  // Styled component
  if (name && name.hasOwnProperty(STYLETRON_KEY)) {
    const component = name[STYLETRON_KEY];
    const stylesArray = component.stylesArray.concat(styles);
    return createStyledComponent(component.name, stylesArray);

    // Tag name or non-styled component
  } else if (isString(name) || isFunction(name)) {
    return createStyledComponent(name, [styles]);
  }

  throw new Error('`styled` takes either a DOM element name or a component');
}

function createStyledComponent(name, stylesArray) {
  function StyledComponent(props, context) {
    const newProps = assign({}, props);
    const styles = resolveStyles(stylesArray, props, context);
    const className = injectStylePrefixed(context.styletron, styles);

    newProps.className = props.className
      ? `${props.className} ${className}`
      : className;

    if (isFunction(props.innerRef)) {
      newProps.ref = props.innerRef;
      delete newProps.innerRef;
    }
    return createElement(name, newProps);
  }

  StyledComponent[STYLETRON_KEY] = {name, stylesArray};

  return StyledComponent;
}

function resolveStyles(stylesArray, props, context) {
  const resolvedStyles = {};
  for (let i = 0, l = stylesArray.length, styles; i < l; i++) {
    styles = stylesArray[i];
    if (!isNil(styles)) {
      if (isFunction(styles)) {
        assign(resolvedStyles, styles(props, context));
      } else if (isObject(styles)) {
        assign(resolvedStyles, styles);
      }
    }
  }
  return resolvedStyles;
}
