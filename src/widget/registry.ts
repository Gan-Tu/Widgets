/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";

import { Badge, Button, Icon, Image } from "./components/content";
import { Basic, Card, ListView, ListViewItem } from "./components/containers";
import { Box, Col, Divider, Row, Spacer } from "./components/layout";
import { Chart } from "./components/chart";
import { Checkbox, DatePicker, Form, Input, Label, RadioGroup, Select, Textarea } from "./components/forms";
import { Text, Title, Caption, Markdown } from "./components/text";
import { Transition } from "./components/transition";
import { Avatar, Progress } from "./components/extras";

export type ComponentRegistry = Record<string, React.ComponentType<any>>;

export const widgetRegistry: ComponentRegistry = {
  Basic,
  Card,
  ListView,
  ListViewItem,
  Box,
  Row,
  Col,
  Divider,
  Icon,
  Image,
  Button,
  Checkbox,
  Chart,
  Spacer,
  Select,
  DatePicker,
  Form,
  Input,
  Label,
  RadioGroup,
  Textarea,
  Transition,
  Text,
  Title,
  Caption,
  Badge,
  Markdown,
  Avatar,
  Progress
};
