/**
 * Componentes utilitarios para renderizado condicional
 */

import React, { ReactNode } from 'react';

interface IfProps {
  condition: boolean;
  children: ReactNode;
}

interface ElseProps {
  children: ReactNode;
}

interface SwitchProps {
  children: ReactNode;
}

interface CaseProps {
  condition: boolean;
  children: ReactNode;
}

interface DefaultProps {
  children: ReactNode;
}

/**
 * Componente If
 * Renderiza el contenido solo si la condición es verdadera
 * 
 * @example
 * <If condition={isLoggedIn}>
 *   <p>Bienvenido</p>
 * </If>
 */
export function If({ condition, children }: IfProps) {
  return condition ? <>{children}</> : null;
}

/**
 * Componente Else
 * Se usa junto con If para renderizar contenido alternativo
 * 
 * @example
 * <If condition={isLoggedIn}>
 *   <p>Bienvenido</p>
 *   <Else>
 *     <p>Por favor inicia sesión</p>
 *   </Else>
 * </If>
 */
export function Else({ children }: ElseProps) {
  return <>{children}</>;
}

// Extender If para manejar Else como hijo
If.prototype.withElseSupport = function(props: IfProps) {
  if (!props.condition) {
    const elseChild = React.Children.toArray(props.children).find(
      (child) => React.isValidElement(child) && child.type === Else
    );
    
    if (elseChild && React.isValidElement(elseChild)) {
      return <>{(elseChild as React.ReactElement<ElseProps>).props.children}</>;
    }
  } else {
    const nonElseChildren = React.Children.toArray(props.children).filter(
      (child) => !(React.isValidElement(child) && child.type === Else)
    );
    
    return <>{nonElseChildren}</>;
  }
  
  return props.condition ? <>{props.children}</> : null;
};

/**
 * Componente For
 * Renderiza una lista de elementos
 * 
 * @example
 * <For each={items}>
 *   {(item, index) => (
 *     <div key={index}>{item.name}</div>
 *   )}
 * </For>
 */
export function For<T>({
  each,
  children,
}: {
  each: T[];
  children: (item: T, index: number) => ReactNode;
}) {
  return <>{each.map(children)}</>;
}

/**
 * Componente Show
 * Renderiza el primer caso verdadero o el valor por defecto
 * 
 * @example
 * <Show
 *   when={status === 'loading'}
 *   fallback={<p>No hay datos</p>}
 * >
 *   <DataList data={data} />
 * </Show>
 */
export function Show({
  when,
  fallback,
  children,
}: {
  when: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  return when ? <>{children}</> : <>{fallback}</>;
}

/**
 * Componente Switch/Case
 * Permite renderizar diferentes contenidos basados en condiciones
 * 
 * @example
 * <Switch>
 *   <Case condition={status === 'loading'}>
 *     <Spinner />
 *   </Case>
 *   <Case condition={status === 'error'}>
 *     <ErrorMessage />
 *   </Case>
 *   <Default>
 *     <Content />
 *   </Default>
 * </Switch>
 */
export function Switch({ children }: SwitchProps) {
  let content: ReactNode = null;
  let found = false;
  
  React.Children.forEach(children, (child) => {
    if (found) return;
    
    if (
      React.isValidElement(child) &&
      child.type === Case &&
      (child as React.ReactElement<CaseProps>).props.condition
    ) {
      content = (child as React.ReactElement<CaseProps>).props.children;
      found = true;
    }
    
    if (
      !found &&
      React.isValidElement(child) &&
      child.type === Default
    ) {
      content = (child as React.ReactElement<DefaultProps>).props.children;
    }
  });
  
  return <>{content}</>;
}

export function Case({ condition, children }: CaseProps) {
  return null; // Este componente no renderiza por sí mismo
}

export function Default({ children }: DefaultProps) {
  return null; // Este componente no renderiza por sí mismo
}

/**
 * Componente ConditionalWrapper
 * Envuelve el children en un wrapper solo si la condición es verdadera
 * 
 * @example
 * <ConditionalWrapper
 *   condition={isAdmin}
 *   wrapper={(children) => <AdminLayout>{children}</AdminLayout>}
 * >
 *   <Content />
 * </ConditionalWrapper>
 */
export function ConditionalWrapper({
  condition,
  wrapper,
  children,
}: {
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
  children: ReactNode;
}) {
  return condition ? <>{wrapper(children)}</> : <>{children}</>;
} 