/**
 * Created by tino on 6/6/17.
 */
import React, { PureComponent } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Modal,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  TextInput,
  Pressable,
} from "react-native";
import moment from "moment";
import PropTypes from "prop-types";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import styles from "./styles";
import Collapsible from "react-native-collapsible";
import Comment from "./Comment";

const screen = Dimensions.get("screen");

export default class Comments extends PureComponent {
  constructor(props) {
    super(props);
    this.bookmark = null;
    this.props = props;
    this.state = {
      replyCommentText: null,
      editCommentText: null,
      editingComment: null,
      newCommentText: null,
      loadingComments: !(props.data && props.data.length),
      likesModalVisible: false,
      likesModalData: null,
      editModalVisible: false,
      expanded: [],
      pagination: [],
    };

    this.textInputs = [];
    this.renderComment = this.renderComment.bind(this);

    this.handleReport = this.handleReport.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUsernameTap = this.handleUsernameTap.bind(this);
    this.handleLikesTap = this.handleLikesTap.bind(this);
    this.handleEditAction = this.handleEditAction.bind(this);
    this.renderLike = this.renderLike.bind(this);
    this.getStyle = this.getStyle.bind(this);
  }

  getStyle(name) {
    return this.props.styles && this.props.styles[name]
      ? this.props.styles[name]
      : {};
  }

  setLikesModalVisible(visible) {
    this.setState({ likesModalVisible: visible });
  }

  setEditModalVisible(visible) {
    this.setState({ editModalVisible: visible });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      this.setState({
        loadingComments: false,
      });
    }
  }

  renderIcon(props) {
    return <MaterialCommunityIcons {...props} />;
  }

  isExpanded(id) {
    return this.state.expanded.indexOf(id) !== -1;
  }

  toggleExpand(c, focus) {
    const id = this.props.keyExtractor(c);
    let expanded = this.state.expanded;

    let index = expanded.indexOf(id);

    if (index === -1) {
      expanded.push(id);
    } else {
      expanded.splice(index, 1);
    }
    this.forceUpdate();
    this.setState({ expanded: expanded });
    if (focus && index === -1) {
      this.focusOnReplyInput(id);
    }
  }

  handleReport(c) {
    this.props.reportAction(c);
  }

  focusOnReplyInput(id) {
    let input = this.textInputs["input" + id];

    input &&
      input.measure((x, y, width, height, pageX, pageY) => {
        input.focus();
        this.props.replyAction(pageY);
      });
  }

  handleReply(c) {
    if (!this.props.isChild) return;
    if (!this.props.isChild(c)) {
      this.toggleExpand(c, true);
    } else {
      this.focusOnReplyInput(this.props.parentIdExtractor(c));
    }
  }

  handleLike(c) {
    this.props.likeAction(c);
  }

  handleDelete(c) {
    this.props.deleteAction(c);
  }

  handleEdit(c) {
    this.setState({
      editCommentText: this.props.bodyExtractor(c),
      editingComment: c,
    });

    this.setEditModalVisible(!this.state.editModalVisible);
  }

  handleUsernameTap(user_id) {
    if (this.props.usernameTapAction) {
      this.props.usernameTapAction(user_id);
    }
  }

  handleLikesTap(c) {
    this.setState({ likesModalData: this.props.likesExtractor(c) });
    this.setLikesModalVisible(!this.state.likesModalVisible);
  }

  handleEditAction(c) {
    this.props.editAction(this.state.editCommentText, c);
  }

  /**
   *
   * Generates a single comment
   * */
  generateComment(c, styles, likedColor, unlikedColor) {
    return (
      <Comment
        styles={styles}
        likedColor={likedColor}
        unlikedColor={unlikedColor}
        data={c}
        id={this.props.keyExtractor(c)}
        usernameTapAction={this.handleUsernameTap}
        username={this.props.usernameExtractor(c)}
        user_id={this.props.userIdExtractor(c)}
        body={this.props.bodyExtractor(c)}
        likesNr={
          this.props.likesExtractor(c) ? this.props.likesExtractor(c).length : 0
        }
        canEdit={this.canUserEdit(c)}
        updatedAt={this.props.editTimeExtractor(c)}
        replyAction={this.props.replyAction ? this.handleReply : null}
        image={this.props.imageExtractor(c)}
        child={true}
        isOwnComment={this.props.userIdExtractor(c) == this.props.viewingUserId}
        reportAction={this.props.reportAction ? this.handleReport : null}
        liked={this.props.likeExtractor ? this.props.likeExtractor(c) : null}
        reported={
          this.props.reportedExtractor ? this.props.reportedExtractor(c) : null
        }
        likeAction={this.props.likeAction ? this.handleLike : null}
        editAction={this.handleEditAction}
        deleteAction={this.handleDelete}
        editComment={this.handleEdit}
        likesTapAction={this.props.likeAction ? this.handleLikesTap : null}
      />
    );
  }

  /**
   * Renders comments children
   * */
  renderChildren(items, styles, likedColor, unlikedColor) {
    if (!items || !items.length) return;
    let self = this;
    return items.map(function (c) {
      return (
        <View key={self.props.keyExtractor(c) + "" + Math.random()}>
          {self.generateComment(c, styles, likedColor, unlikedColor)}
        </View>
      );
    });
  }

  /**
   * Returns last child id
   * */
  getLastChildCommentId(item) {
    if (!item) return;
    const items = item[this.props.childPropName];
    return this.props.keyExtractor(items[items.length - 1]);
  }

  /**
   * Returns first child id
   * */
  getFirstChildCommentId(item) {
    if (!item) return;
    const items = item[this.props.childPropName];

    return this.props.keyExtractor(items[0]);
  }

  /**
   * Does a pagination action
   * */
  paginate(fromCommentId, direction, parentCommentId) {
    this.setState({ loadingComments: true });
    this.props.paginateAction(fromCommentId, direction, parentCommentId);
  }

  /**
   * Can user edit a comment
   * */
  canUserEdit(item) {
    if (
      this.props.viewingUserId == this.props.userIdExtractor(item) ||
      this.props.userIsAdmin
    ) {
      if (!this.props.editMinuteLimit) return true;
      let created =
        moment(this.props.createdTimeExtractor(item)).valueOf() / 1000;

      return (
        new Date().getTime() / 1000 - created < this.props.editMinuteLimit * 60
      );
    }
    return false;
  }

  renderLike(l) {
    let like = l.item;
    return (
      <Pressable
        key={like.user_id + ""}
        onPress={() => {
          this.setLikesModalVisible(false);
        }}
        style={[styles.likeContainer, this.getStyle("likeContainer")]}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: 30 }}>
            <Image
              style={[styles.likeImage, this.getStyle("likeImage")]}
              source={{ uri: like.image }}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.likeName, this.getStyle("likeName")]}>
              {like.name}
            </Text>
          </View>
          <View style={{ width: 100 }}>
            <Pressable
              style={[
                {
                  borderRadius: 5,
                  backgroundColor: this.props.likedColor,
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 3,
                  paddingBottom: 0,
                  margin: 0,
                  flex: 1,
                  flexDirection: "row",
                  alignContent: "center",
                  justifyContent: "center",
                  maxHeight: 25,
                },
                this.getStyle("likeProfileButton"),
              ]}
              onPress={() => {
                this.setLikesModalVisible(false);
                like.tap(like.user_id);
              }}
            >
              <Text
                style={[
                  {
                    color: "rgb(255,255,255)",
                    fontSize: 13,
                    marginLeft: 10,
                    marginRight: 10,
                    textTransform: "capitalize",
                  },
                  this.getStyle("likeProfileButtonText"),
                ]}
              >
                Profile
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  /**
   * Renders a comment with pagination
   * */
  renderComment(item, styles, likedColor, unlikedColor) {
    return (
      <View>
        {this.generateComment(item, styles, likedColor, unlikedColor)}
        <View style={{ marginLeft: 40 }}>
          {this.props.childrenCountExtractor(item) &&
          this.props.childPropName ? (
            <Pressable onPress={() => this.toggleExpand(item)}>
              <View
                style={[styles.repliedSection, this.getStyle("repliedSection")]}
              >
                <Text
                  style={[styles.repliedCount, this.getStyle("repliedCount")]}
                >
                  {this.isExpanded(this.props.keyExtractor(item))
                    ? "Hide "
                    : "View "}
                  {this.props.childrenCountExtractor(item) > 1
                    ? this.props.childrenCountExtractor(item)
                    : ""}
                  {this.props.childrenCountExtractor(item) > 1
                    ? " Replies"
                    : " Reply"}
                </Text>
              </View>
            </Pressable>
          ) : null}
          <Collapsible
            easing={"easeOutCubic"}
            duration={400}
            collapsed={!this.isExpanded(this.props.keyExtractor(item))}
          >
            {this.props.childrenCountExtractor(item) &&
            this.props.paginateAction ? (
              <View>
                {this.props.childPropName &&
                this.props.childrenCountExtractor(item) >
                  item[this.props.childPropName].length ? (
                  <Pressable
                    onPress={() =>
                      this.paginate(
                        this.getFirstChildCommentId(item),
                        "down",
                        this.props.keyExtractor(item)
                      )
                    }
                  >
                    <Text
                      style={[
                        { textAlign: "center", paddingTop: 15 },
                        this.getStyle("previousText"),
                      ]}
                    >
                      Show previous...
                    </Text>
                  </Pressable>
                ) : null}

                {this.renderChildren(
                  item[this.props.childPropName],
                  styles,
                  likedColor,
                  unlikedColor
                  // this.props.keyExtractor(item)
                )}

                {this.props.childrenCountExtractor(item) >
                  item[this.props.childPropName].length &&
                this.props.paginateAction ? (
                  <Pressable
                    onPress={() =>
                      this.paginate(
                        this.getLastChildCommentId(item),
                        "up",
                        this.props.keyExtractor(item)
                      )
                    }
                  >
                    <Text
                      style={[
                        { textAlign: "center", paddingTop: 15 },
                        this.getStyle("moreText"),
                      ]}
                    >
                      Show more...
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              this.renderChildren(
                item[this.props.childPropName],
                styles,
                likedColor,
                unlikedColor
                // this.props.keyExtractor(item)
              )
            )}
            <View style={[styles.inputSection, this.getStyle("inputSection")]}>
              <TextInput
                ref={(input) =>
                  (this.textInputs["input" + this.props.keyExtractor(item)] =
                    input)
                }
                style={[styles.input, this.getStyle("input")]}
                multiline={true}
                value={this.state.replyCommentText}
                onChangeText={(text) =>
                  this.setState({ replyCommentText: text })
                }
                placeholder={"Write reply"}
                numberOfLines={3}
                placeholderTextColor={this.props.inputPlaceholderTextColor}
              />
              <Pressable
                onPress={() => {
                  this.props.saveAction(
                    this.state.replyCommentText,
                    this.props.keyExtractor(item)
                  );
                  this.setState({ replyCommentText: null });
                  Keyboard.dismiss();
                }}
              >
                {this.renderIcon({
                  style: [styles.submit, this.getStyle("submit")],
                  name: "send",
                  size: 25,
                  color: this.props.submitButtonColor || "gray",
                })}
              </Pressable>
            </View>
          </Collapsible>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.inputSection, this.getStyle("inputSection")]}>
          <TextInput
            style={[styles.input, this.getStyle("input")]}
            ref={(input) => (this.textInputs["inputMain"] = input)}
            multiline={true}
            onChangeText={(text) => this.setState({ newCommentText: text })}
            placeholder={"Write comment"}
            numberOfLines={3}
            placeholderTextColor={this.props.inputPlaceholderTextColor}
          />
          <Pressable
            onPress={() => {
              this.props.saveAction(this.state.newCommentText, false);
              this.setState({ newCommentText: null });
              this.textInputs["inputMain"].clear();
              Keyboard.dismiss();
            }}
          >
            {this.renderIcon({
              style: [styles.submit, this.getStyle("submit")],
              name: "send",
              size: 25,
              color: this.props.submitButtonColor || "gray",
            })}
          </Pressable>
        </View>

        {!this.props.loadingComments &&
        this.props.data &&
        this.props.data.length &&
        this.props.paginateAction ? (
          <Pressable
            onPress={() => {
              this.paginate(
                this.props.keyExtractor(this.props.data[0]),
                "down"
              );
            }}
          >
            <View>
              <Text
                style={[
                  { textAlign: "center", color: "gray" },
                  this.getStyle("previousText"),
                ]}
              >
                Show previous
              </Text>
            </View>
          </Pressable>
        ) : null}
        {/* Comments */}
        {this.props.data.length > 0 ? (
          <>
            {this.props.data.map((item) => {
              return (
                <React.Fragment key={this.props.keyExtractor(item) + ""}>
                  {this.renderComment(
                    item,
                    this.props.styles,
                    this.props.likedColor,
                    this.props.unlikedColor
                  )}
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <Text
            style={[{ textAlign: "center" }, this.getStyle("noCommentsYet")]}
          >
            No comments yet
          </Text>
        )}

        {this.props.loadingComments ? (
          <View
            style={{
              position: "absolute",
              zIndex: 10,
              bottom: 0,
              height: 60,
              backgroundColor:
                this.props.backgroundColor || "rgba(255,255,255, 0.9)",
            }}
          >
            <ActivityIndicator
              animating={true}
              style={{
                height: 50,
                width: screen.width,
                alignItems: "center",
                justifyContent: "center",
              }}
              color={this.props.likedColor || "blue"}
              size="small"
            />
          </View>
        ) : null}

        {!this.props.loadingComments &&
        this.props.data &&
        this.props.data.length &&
        this.props.paginateAction ? (
          <Pressable
            style={{ height: 70 }}
            onPress={() => {
              this.paginate(
                this.props.keyExtractor(
                  this.props.data[this.props.data.length - 1]
                ),
                "up"
              );
            }}
          >
            <Text style={{ textAlign: "center", color: "gray" }}>
              Show more
            </Text>
          </Pressable>
        ) : null}

        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.likesModalVisible}
          onRequestClose={() => {
            this.setLikesModalVisible(false);
          }}
          style={[this.getStyle("likeModal")]}
        >
          <View style={[this.getStyle("likeModalContainer")]}>
            <View
              style={[
                {
                  paddingTop: 50,
                  paddingBottom: 15,
                  flexDirection: "row",
                },
                this.getStyle("likeModalContainerHeader"),
              ]}
            >
              <View style={{ width: 30 }}>
                <Pressable
                  style={[
                    {
                      margin: 0,
                      padding: 5,
                    },
                    this.getStyle("likeModalCloseButton"),
                  ]}
                  onPress={() => this.setLikesModalVisible(false)}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={30}
                    color={this.props.submitButtonColor || "gray"}
                  />
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    {
                      textAlign: "center",
                      fontSize: 20,
                      lineHeight: 35,
                    },
                    this.getStyle("likeHeader"),
                  ]}
                >
                  Users that liked the Comment
                </Text>
              </View>
              <View style={{ width: 30 }}></View>
            </View>
            {this.state.likesModalVisible ? (
              <FlatList
                initialNumToRender="10"
                keyExtractor={(item) => item.like_id + ""}
                data={this.state.likesModalData}
                renderItem={this.renderLike}
              />
            ) : null}
          </View>
        </Modal>

        <Modal
          animationType={"slide"}
          onShow={() => {
            this.textInputs["editCommentInput"].focus();
          }}
          transparent={true}
          visible={this.state.editModalVisible}
          onRequestClose={() => {
            this.setEditModalVisible(false);
            this.setState({ editModalData: null });
          }}
        >
          <View
            style={[
              styles.editModalContainer,
              this.getStyle("editModalContainer"),
            ]}
          >
            <View style={[styles.editModal, this.getStyle("editModal")]}>
              <TextInput
                ref={(input) => (this.textInputs["editCommentInput"] = input)}
                style={[styles.input, this.getStyle("input")]}
                multiline={true}
                value={this.state.editCommentText}
                onChangeText={(text) =>
                  this.setState({ editCommentText: text })
                }
                placeholder={"Edit comment"}
                numberOfLines={3}
                placeholderTextColor={this.props.inputPlaceholderTextColor}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <Pressable onPress={() => this.setEditModalVisible(false)}>
                  <View
                    style={[
                      styles.editButtons,
                      this.getStyle("editButtons"),
                      this.getStyle("editButtonClose"),
                    ]}
                  >
                    {this.renderIcon({
                      name: "close",
                      size: 20,
                      color: this.props.submitButtonColor || "gray",
                    })}
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    this.props.editAction(
                      this.state.editCommentText,
                      this.state.editingComment
                    );
                    this.setEditModalVisible(!this.state.editModalVisible);
                  }}
                >
                  <View
                    style={[
                      styles.editButtons,
                      this.getStyle("editButtons"),
                      this.getStyle("editButtonSave"),
                    ]}
                  >
                    {this.renderIcon({
                      name: "check",
                      size: 20,
                      color: this.props.submitButtonColor || "gray",
                    })}
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

Comments.propTypes = {
  data: PropTypes.array.isRequired,
  loadingComments: PropTypes.bool,
  viewingUserName: PropTypes.string,
  viewingUserId: PropTypes.string,
  initialDisplayCount: PropTypes.number,
  editMinuteLimit: PropTypes.number,
  usernameTapAction: PropTypes.func,
  childPropName: PropTypes.string,
  isChild: PropTypes.func,
  keyExtractor: PropTypes.func.isRequired,
  parentIdExtractor: PropTypes.func,
  usernameExtractor: PropTypes.func.isRequired,
  userIdExtractor: PropTypes.func.isRequired,
  editTimeExtractor: PropTypes.func.isRequired,
  createdTimeExtractor: PropTypes.func.isRequired,
  bodyExtractor: PropTypes.func.isRequired,
  imageExtractor: PropTypes.func.isRequired,
  likeExtractor: PropTypes.func,
  reportedExtractor: PropTypes.func,
  likesExtractor: PropTypes.func,
  childrenCountExtractor: PropTypes.func,
  replyAction: PropTypes.func,
  saveAction: PropTypes.func.isRequired,
  deleteAction: PropTypes.func,
  editAction: PropTypes.func.isRequired,
  reportAction: PropTypes.func,
  likeAction: PropTypes.func,
  paginateAction: PropTypes.func,
  backgroundColor: PropTypes.string,
  styles: PropTypes.object,
  likedColor: PropTypes.string,
  unlikedColor: PropTypes.string,
  submitButtonColor: PropTypes.string,
  inputPlaceholderTextColor: PropTypes.string,
};
