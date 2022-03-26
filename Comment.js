/**
 * Created by tino on 6/6/17.
 */
import React, { PureComponent } from "react";
import {
  View,
  Text,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Alert
} from "react-native";

import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/FontAwesome";
import styles from "./styles";

function timeDifference(current, previous) {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
      return 'Now';
  }

  else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago';
  }

  else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago';
  }

  else if (elapsed < msPerMonth) {
      return Math.round(elapsed / msPerDay) + ' days ago';
  }

  else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + ' months ago';
  }

  else {
      return Math.round(elapsed / msPerYear) + ' years ago';
  }
}

function convertToDate (value) {
  if (value === undefined || value === null || value === '') {
    return new Date();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return moment(value).toDate();
  }
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    try {
      return value.toDate();
    } catch (err) {
      return new Date();
    }
  }
  if (typeof value === 'object') {
    return value;
  }
  return new Date();
};

export default class Comment extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      menuVisible: false
    };

    this.handleReport = this.handleReport.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUsernameTap = this.handleUsernameTap.bind(this);
    this.handleLikesTap = this.handleLikesTap.bind(this);
    this.getStyle = this.getStyle.bind(this)
  }

  getStyle(name) {
    this.props.styles && this.props.styles[name] ? this.props.styles[name] : {};
  }

  handleReport() {
    Alert.alert(
      "Confirm report",
      "Are you sure you want to report?",
      [
        {
          text: "Yes",
          onPress: () => this.props.reportAction(this.props.data)
        },
        { text: "No", onPress: () => null }
      ],
      true
    );
    this.setState({ menuVisible: false });
  }
  handleReply() {
    this.props.replyAction(this.props.data);
  }
  handleLike() {
    this.props.likeAction(this.props.data);
  }
  handleEdit() {
    this.props.editComment(this.props.data);
    this.setState({ menuVisible: false });
  }

  handleDelete() {
    Alert.alert(
      "Confirm delete",
      "Are you sure you want to delete?",
      [
        {
          text: "Yes",
          onPress: () => this.props.deleteAction(this.props.data)
        },
        { text: "No", onPress: () => null }
      ],
      true
    );
    this.setState({ menuVisible: false });
  }
  handleUsernameTap() {
    if (this.props.usernameTapAction) {
      this.props.usernameTapAction(this.props.username);
    }
  }
  handleLikesTap() {
    this.props.likesTapAction(this.props.data);
  }

  setModalVisible() {
    this.setState({ menuVisible: !this.state.menuVisible });
  }

  render() {
    console.log('render styles', this.props.styles, this.props.styles['commentContainer'])
    return (
      <View
        style={[styles.commentContainer, this.getStyle("commentContainer")]}
      >
        <View style={[styles.left, this.getStyle("left")]}>
          <TouchableHighlight onPress={this.handleUsernameTap}>
            <View style={{ alignItems: "center" }}>
              <Image
                style={[
                  styles.image,
                  { width: 30, height: 30, borderRadius: 15 },
                  this.getStyle("avatar")
                ]}
                source={
                  this.props.image === ""
                    ? require("./no-user.png")
                    : { uri: this.props.image }
                }
              />
              {this.props.likesNr && this.props.likeAction ? (
                <TouchableHighlight
                  style={[styles.actionButton, { paddingTop: 5 }, this.getStyle("actionButton")]}
                  onPress={this.handleLikesTap}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Icon name="heart" color="#df1740" size={15} />
                    <Text style={[styles.likeNr, this.getStyle("likeNr")]}> {this.props.likesNr}</Text>
                  </View>
                </TouchableHighlight>
              ) : null}
            </View>
          </TouchableHighlight>
        </View>
        <TouchableOpacity
          onPress={() => this.setState({ menuVisible: false })}
          onLongPress={() => this.setModalVisible()}
          style={[styles.right, this.getStyle("right")]}
        >
          <View style={[styles.rightContent, this.getStyle("rightContent")]}>
            <View style={[styles.rightContentTop, this.getStyle("rightContentTop")]}>
              <TouchableHighlight onPress={this.handleUsernameTap}>
                <Text style={[styles.name, this.getStyle("username")]}>
                  {this.props.username}
                </Text>
              </TouchableHighlight>
            </View>
            <Text style={[styles.body, this.getStyle("body")]}>
              {this.props.body}
            </Text>
          </View>
          <View style={[styles.rightActionBar, this.getStyle("rightActionBar")]}>
            <Text
            style={[styles.time, this.getStyle("timeAgoText")]}
            >
              {timeDifference(new Date(), convertToDate(this.props.updatedAt))}
            </Text>
            {this.props.likeAction ? (
              <TouchableHighlight
                style={[styles.actionButton, this.getStyle("actionButton")]}
                onPress={this.handleLike}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.actionText,
                      { color: this.props.liked ? "#4DB2DF" : null },
                      this.getStyle("actionText"),
                      this.getStyle("likeText")
                    ]}
                  >
                    Like{" "}
                  </Text>
                </View>
              </TouchableHighlight>
            ) : null}
            {this.props.replyAction ? (
              <TouchableHighlight
                style={[styles.actionButton, this.getStyle("actionButton")]}
                onPress={this.handleReply}
              >
                <Text
                  style={[
                    styles.actionText,
                    this.getStyle("actionText"),
                    this.getStyle("replyText")
                  ]}
                >
                  Reply
                </Text>
              </TouchableHighlight>
            ) : null}
          </View>
        </TouchableOpacity>
        {this.state.menuVisible ? (
          <View style={[styles.menu, this.getStyle("menu")]}>
            <View style={{ flex: 1.5 }}>
              {this.props.canEdit ? (
                <TouchableOpacity
                  style={[styles.menuItem, this.getStyle("menuItem")]}
                  onPress={this.handleEdit}
                >
                  <Text
                    style={[
                      styles.menuText,
                      this.getStyle("menuText"),
                      this.getStyle("editText")
                    ]}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              ) : null}
              {this.props.reportAction && !this.props.isOwnComment ? (
                <TouchableOpacity
                  style={[styles.menuItem, this.getStyle("menuItem")]}
                  onPress={this.handleReport}
                >
                  {this.props.reported ? (
                    <Text
                      style={[
                        styles.menuText,
                        { fontStyle: "italic", fontSize: 11 },
                        this.getStyle("menuText"),
                        this.getStyle("reportedText")
                      ]}
                    >
                      Reported
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.menuText,
                        this.getStyle("menuText"),
                        this.getStyle("reportText")
                      ]}
                    >
                      Report
                    </Text>
                  )}
                </TouchableOpacity>
              ) : null}
              {this.props.canEdit ? (
                <TouchableOpacity
                  style={[styles.menuItem, this.getStyle("menuItem")]}
                  onPress={this.handleDelete}
                >
                  <Text
                    style={[
                      styles.menuText,
                      this.getStyle("menuText"),
                      this.getStyle("deleteText")
                    ]}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View
              style={{
                flex: 0.5,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <TouchableOpacity
                style={[styles.menuClose, this.getStyle("menuClose")]}
                onPress={() => this.setState({ menuVisible: false })}
              >
                <Text style={{ color: "silver" }}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    );
  }
}

Comment.propTypes = {
  data: PropTypes.object,
  body: PropTypes.string,
  styles: PropTypes.object,
  canEdit: PropTypes.bool,
  canEdit: PropTypes.bool,
  child: PropTypes.bool,
  editComment: PropTypes.func,
  likeAction: PropTypes.func,
  liked: PropTypes.bool,
  likesNr: PropTypes.number,
  likesTapAction: PropTypes.func,
  replyAction: PropTypes.func,
  deleteAction: PropTypes.func,
  reportAction: PropTypes.func,
  reported: PropTypes.bool,
  updatedAt: PropTypes.string,
  username: PropTypes.string,
  usernameTapAction: PropTypes.func
};
