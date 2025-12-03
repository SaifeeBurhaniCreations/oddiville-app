import React from 'react'
import RnToast from 'react-native-toast-message';

const Toast = () => {
    RnToast.show({
        type: 'info', // or 'info', 'error'
        text1: 'info',
        text2: 'A link to change the mobile number has been sent to your registered email address.'
      });
      
  return (
    <React.Fragment>
    </React.Fragment>
  )
}

export default Toast
