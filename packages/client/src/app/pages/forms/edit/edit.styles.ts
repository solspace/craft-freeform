import { createGlobalStyle } from 'styled-components';

export const EditorGlobalStyles = createGlobalStyle`
  #freeform-client-app {
    height: 100vh;
  }

  #global-header, #global-footer {
    display: none;
  }

  #main-container {
    #main {
      #main-content {
        padding: 0;
        width: calc(100vw - 226px);
      }
    }
  }

  /* #global-sidebar {
    width: 50px;
    overflow: hidden;

    #system-name {
      display: none;
    }

    nav#nav {
      margin: 8px 0 0;

      > ul > li {
        > a {
          padding: 8px 8px;
        }

        .label {
          display: none;
        }

        .subnav {
          display: none;
        }
      }
    }
  } */

  /* #page-container {
    padding-left: 50px !important;
  } */
`;
