import React, { useRef, useEffect } from 'react';
import ActionSheet from 'react-native-actionsheet';

const EditOptions = ({ setModalVisible, canEdit, reportAction, isOwnComment, reported }) => {
    const actionSheetRef = useRef(null);

    useEffect(() => {
        if (actionSheetRef && actionSheetRef.current) {
            actionSheetRef.current.show();
        }
    }, [actionSheetRef, actionSheetRef.current]);

    const options = () => {
        let optionsArr = [];
        optionsArr.push('Cancel')
        if (canEdit) {
            optionsArr.push('Edit');
            optionsArr.push('Delete');
        }
        if (reportAction && !isOwnComment) {
            optionsArr.push(reported ? 'Reported' : 'Report');
        }
        return optionsArr;
    }

    const optionsActions = () => {
        let optionsArrActions = [];
        optionsArrActions.push(() => { 
            setModalVisible();
         })
        if (canEdit) {
            optionsArrActions.push(handleEdit)
            optionsArrActions.push(handleDelete)
        }
        if (reportAction && !isOwnComment) {
            optionsArrActions.push(reportAction)
        }
        return optionsArrActions;
    }

    return <ActionSheet
        ref={actionSheetRef}
        options={options()}
        cancelButtonIndex={0}
        destructiveButtonIndex={2}
        onPress={buttonIndex => {
            optionsActions()[buttonIndex]
        }}
    />
}

export default EditOptions;