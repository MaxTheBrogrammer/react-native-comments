/**
 * Created by tino on 6/6/17.
 */
import React, { PureComponent } from "react";
import { View, Text, Image, Pressable, Alert } from "react-native";

import PropTypes from "prop-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "./styles";
import EditOptions from "./EditOptions";

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return "Now";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

function convertToDate(value) {
  if (value === undefined || value === null || value === "") {
    return new Date();
  }
  if (typeof value === "string" || typeof value === "number") {
    return moment(value).toDate();
  }
  if (typeof value === "object" && typeof value.seconds === "number") {
    try {
      return value.toDate();
    } catch (err) {
      return new Date();
    }
  }
  if (typeof value === "object") {
    return value;
  }
  return new Date();
}

export default class Comment extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      menuVisible: false,
    };

    this.handleReport = this.handleReport.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUsernameTap = this.handleUsernameTap.bind(this);
    this.handleLikesTap = this.handleLikesTap.bind(this);
    this.getStyle = this.getStyle.bind(this);
  }

  getStyle(name) {
    return this.props.styles && this.props.styles[name]
      ? this.props.styles[name]
      : {};
  }

  handleReport() {
    this.setState({ menuVisible: false });
    Alert.alert(
      "Confirm report",
      "Are you sure you want to report?",
      [
        {
          text: "Yes",
          onPress: () => this.props.reportAction(this.props.data),
        },
        { text: "No", onPress: () => null },
      ],
      true
    );
  }
  handleReply() {
    this.props.replyAction(this.props.data);
  }
  handleLike() {
    this.props.likeAction(this.props.data);
  }
  handleEdit() {
    this.setState({ menuVisible: false });
    this.props.editComment(this.props.data);
  }

  handleDelete() {
    this.setState({ menuVisible: false });
    Alert.alert(
      "Confirm delete",
      "Are you sure you want to delete?",
      [
        {
          text: "Yes",
          onPress: () => this.props.deleteAction(this.props.data),
        },
        { text: "No", onPress: () => null },
      ],
      true
    );
  }
  handleUsernameTap() {
    if (this.props.usernameTapAction) {
      this.props.usernameTapAction(this.props.user_id);
    }
  }
  handleLikesTap() {
    this.props.likesTapAction(this.props.data);
  }

  setModalVisible() {
    this.setState({ menuVisible: !this.state.menuVisible });
  }

  render() {
    return (
      <View
        style={[styles.commentContainer, this.getStyle("commentContainer")]}
      >
        <View style={[styles.left, this.getStyle("left")]}>
          <Pressable onPress={this.handleUsernameTap}>
            <View style={{ alignItems: "center" }}>
              <Image
                style={[
                  styles.image,
                  { width: 30, height: 30, borderRadius: 15 },
                  this.getStyle("avatar"),
                ]}
                source={
                  this.props.image === ""
                    ? require("./no-user.png")
                    : { uri: this.props.image }
                }
              />
              {this.props.likesNr && this.props.likeAction ? (
                <Pressable
                  style={[
                    styles.actionButton,
                    { paddingTop: 5 },
                    this.getStyle("actionButton"),
                  ]}
                  onPress={this.handleLikesTap}
                >
                  <View style={{ flexDirection: "row" }}>
                    <MaterialCommunityIcons
                      name="thumb-up"
                      color={this.props.likedColor || "grey"}
                      size={15}
                    />
                    <Text style={[styles.likeNr, this.getStyle("likeNr")]}>
                      {" "}
                      {this.props.likesNr}
                    </Text>
                  </View>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        </View>
        {this.state.menuVisible && (
          <EditOptions
            closeMenu={() => {
              this.setState({ menuVisible: false });
            }}
            canEdit={this.props.canEdit}
            reportAction={this.handleReport}
            isOwnComment={this.props.isOwnComment}
            reported={this.props.reported}
            handleEdit={this.handleEdit}
            handleDelete={this.handleDelete}
          />
        )}
        <Pressable
          onPress={() => this.setState({ menuVisible: false })}
          onLongPress={() => this.setModalVisible()}
          style={[styles.right, this.getStyle("right")]}
        >
          <View style={[styles.rightContent, this.getStyle("rightContent")]}>
            <View
              style={[styles.rightContentTop, this.getStyle("rightContentTop")]}
            >
              <Pressable onPress={this.handleUsernameTap}>
                <Text style={[styles.name, this.getStyle("username")]}>
                  {this.props.username}
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.body, this.getStyle("body")]}>
              {this.props.body}
            </Text>
          </View>
          <View
            style={[styles.rightActionBar, this.getStyle("rightActionBar")]}
          >
            <Text style={[styles.time, this.getStyle("timeAgoText")]}>
              {timeDifference(new Date(), convertToDate(this.props.updatedAt))}
            </Text>
            {this.props.likeAction ? (
              <Pressable
                style={[styles.actionButton, this.getStyle("actionButton")]}
                onPress={this.handleLike}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.actionText,
                      this.getStyle("actionText"),
                      this.getStyle("likeText"),
                      {
                        color: this.props.liked
                          ? this.props.likedColor || "#4DB2DF"
                          : this.props.unlikedColor || "#9B9B9B",
                      },
                    ]}
                  >
                    Like{" "}
                  </Text>
                </View>
              </Pressable>
            ) : null}
            {this.props.replyAction ? (
              <Pressable
                style={[styles.actionButton, this.getStyle("actionButton")]}
                onPress={this.handleReply}
              >
                <Text
                  style={[
                    styles.actionText,
                    this.getStyle("actionText"),
                    this.getStyle("replyText"),
                  ]}
                >
                  Reply
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </View>
    );
  }
}

Comment.propTypes = {
  data: PropTypes.object,
  body: PropTypes.string,
  styles: PropTypes.object,
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
  user_id: PropTypes.string,
  usernameTapAction: PropTypes.func,
  likedColor: PropTypes.string,
  unlikedColor: PropTypes.string,
};
